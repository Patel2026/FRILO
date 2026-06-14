<?php

namespace App\Services;

use App\Content\PublicContentRegistry;
use App\Content\RichContentSanitizer;
use App\Models\ContentBlock;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PublicContentService
{
    private const SETTINGS_MAX_DEPTH = 4;

    private const SETTINGS_MAX_ITEMS = 80;

    private int $settingsItems = 0;

    public function __construct(
        private readonly PublicContentRegistry $registry,
        private readonly RichContentSanitizer $richContentSanitizer,
        private readonly ContentRevisionService $revisionService,
        private readonly AdminAuditLogger $auditLogger
    ) {}

    public function updatePage(PublicPage $page, array $data, User $actor): PublicPage
    {
        return DB::transaction(function () use ($page, $data, $actor): PublicPage {
            $this->registry->page($page->key);
            $payload = $this->onlyAllowed($data, ['name', 'seo_title', 'seo_description', 'is_indexable']);

            $this->revisionService->snapshot($page, 'public_page.updated', $actor);
            $page->update($payload);
            $this->forgetPageCache($page);
            $this->audit('public_page.updated', $page, $actor);

            return $page->fresh();
        });
    }

    public function updateSection(PublicSection $section, array $data, User $actor): PublicSection
    {
        return DB::transaction(function () use ($section, $data, $actor): PublicSection {
            $section->loadMissing('page');
            $definition = $this->sectionDefinitionForPage($section);
            $payload = $this->onlyAllowed($data, ['name', 'position', 'is_visible', 'content']);

            if (($payload['is_visible'] ?? true) === false && ($definition['hideable'] ?? true) === false) {
                throw new InvalidArgumentException('This public section cannot be hidden.');
            }

            if (array_key_exists('content', $payload)) {
                if (! is_array($payload['content'])) {
                    throw new InvalidArgumentException('Public section content must be an array.');
                }

                $payload['content'] = $this->registry->validateSectionContent($section->key, $payload['content']);
            }

            $this->revisionService->snapshot($section, 'public_section.updated', $actor);
            $section->update($payload);
            $this->forgetPageCache($section->page);
            $this->audit('public_section.updated', $section, $actor);

            return $section->fresh();
        });
    }

    public function createBlock(PublicPage $page, array $data, User $actor): ContentBlock
    {
        return DB::transaction(function () use ($page, $data, $actor): ContentBlock {
            $this->registry->page($page->key);
            $payload = $this->blockPayload($page, $data);
            $payload['public_page_id'] = $page->id;
            $payload['position'] = (int) ($data['position'] ?? ((int) $page->blocks()->max('position') + 10));
            $payload['is_visible'] = (bool) ($data['is_visible'] ?? true);

            $block = ContentBlock::create($payload);
            $this->revisionService->snapshot($block, 'content_block.created', $actor);
            $this->forgetPageCache($page);
            $this->audit('content_block.created', $block, $actor);

            return $block->fresh();
        });
    }

    public function updateBlock(ContentBlock $block, array $data, User $actor): ContentBlock
    {
        return DB::transaction(function () use ($block, $data, $actor): ContentBlock {
            $block->loadMissing('page');
            $payload = $this->blockPayload(
                $block->page,
                $this->onlyAllowed($data, ['layout', 'anchor_section_key', 'content', 'settings', 'position', 'is_visible']),
                $block,
            );

            foreach (['position', 'is_visible'] as $field) {
                if (array_key_exists($field, $data)) {
                    $payload[$field] = $field === 'is_visible' ? (bool) $data[$field] : (int) $data[$field];
                }
            }

            $this->revisionService->snapshot($block, 'content_block.updated', $actor);
            $block->update($payload);
            $this->forgetPageCache($block->page);
            $this->audit('content_block.updated', $block, $actor);

            return $block->fresh();
        });
    }

    public function deleteBlock(ContentBlock $block, User $actor): void
    {
        DB::transaction(function () use ($block, $actor): void {
            $block->loadMissing('page');
            $page = $block->page;

            $this->revisionService->snapshot($block, 'content_block.deleted', $actor);
            $this->audit('content_block.deleted', $block, $actor);
            $block->delete();
            $this->forgetPageCache($page);
        });
    }

    /**
     * @param  array<int, int>  $orderedIds
     */
    public function reorderBlocks(PublicPage $page, array $orderedIds, User $actor): void
    {
        DB::transaction(function () use ($page, $orderedIds, $actor): void {
            $this->registry->page($page->key);
            $ids = array_values(array_map('intval', $orderedIds));

            if ($ids === [] || count($ids) !== count(array_unique($ids))) {
                throw new InvalidArgumentException('Invalid block order.');
            }

            $blocks = $page->blocks()->whereIn('id', $ids)->get()->keyBy('id');
            if ($blocks->count() !== count($ids)) {
                throw new InvalidArgumentException('Block order contains unknown items.');
            }

            foreach ($ids as $index => $id) {
                $block = $blocks->get($id);
                $this->revisionService->snapshot($block, 'content_block.reordered', $actor);
                $block->update(['position' => ($index + 1) * 10]);
            }

            $this->forgetPageCache($page);
            $this->audit('content_block.reordered', $page, $actor, ['ordered_ids' => $ids]);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function publicPage(string $pageKey): array
    {
        return Cache::remember("public_content.page.{$pageKey}", 600, function () use ($pageKey): array {
            $definition = $this->registry->page($pageKey);
            $page = PublicPage::query()
                ->where('key', $pageKey)
                ->with(['sections', 'blocks'])
                ->firstOrFail();

            return [
                'page' => [
                    'key' => $page->key,
                    'name' => $page->name,
                    'route_pattern' => $definition['route_pattern'] ?? $page->route_pattern,
                    'seo' => [
                        'title' => $page->seo_title,
                        'description' => $page->seo_description,
                        'is_indexable' => $page->is_indexable,
                    ],
                ],
                'sections' => $page->sections
                    ->filter(fn (PublicSection $section): bool => $this->isPublicSectionRenderable($section, $pageKey))
                    ->map(fn (PublicSection $section): array => [
                        'key' => $section->key,
                        'name' => $section->name,
                        'position' => $section->position,
                        'renderer' => $this->registry->section($section->key)['renderer'],
                        'content' => $section->content,
                    ])
                    ->values()
                    ->all(),
                'blocks' => $page->blocks
                    ->filter(fn (ContentBlock $block): bool => $this->isPublicBlockRenderable($block, $pageKey))
                    ->map(fn (ContentBlock $block): array => [
                        'id' => $block->id,
                        'anchor_section_key' => $block->anchor_section_key,
                        'position' => $block->position,
                        'layout' => $block->layout,
                        'content' => $block->content,
                        'settings' => $block->settings ?? [],
                    ])
                    ->values()
                    ->all(),
            ];
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function blockPayload(PublicPage $page, array $data, ?ContentBlock $block = null): array
    {
        $payload = $this->onlyAllowed($data, ['layout', 'anchor_section_key', 'content', 'settings', 'position', 'is_visible']);
        unset($payload['position'], $payload['is_visible']);
        $layout = (string) ($payload['layout'] ?? $block?->layout);

        if (! in_array($layout, ContentBlock::LAYOUTS, true)) {
            throw new InvalidArgumentException('Invalid content block layout.');
        }

        $payload['layout'] = $layout;
        $payload['anchor_section_key'] = $this->validatedAnchor($page, $payload['anchor_section_key'] ?? $block?->anchor_section_key);

        if (array_key_exists('content', $payload)) {
            if (! is_array($payload['content'])) {
                throw new InvalidArgumentException('Content block content must be an array.');
            }

            $payload['content'] = $this->sanitizeBlockContent($layout, $payload['content']);
        } elseif ($block === null) {
            throw new InvalidArgumentException('Content block content is required.');
        }

        if (array_key_exists('settings', $payload)) {
            $payload['settings'] = $this->sanitizeSettings($payload['settings']);
        } elseif ($block === null) {
            $payload['settings'] = null;
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function sanitizeBlockContent(string $layout, array $content): array
    {
        $allowedKeys = match ($layout) {
            ContentBlock::LAYOUT_FULL_WIDTH => ['body'],
            ContentBlock::LAYOUT_TWO_COLUMNS => ['left', 'right'],
            ContentBlock::LAYOUT_MEDIA_TEXT => array_key_exists('media_label', $content)
                ? ['body', 'media_label']
                : ['body'],
            default => throw new InvalidArgumentException('Invalid content block layout.'),
        };

        $this->assertExactKeys($content, $allowedKeys, 'content');

        $sanitized = [];
        foreach ($allowedKeys as $key) {
            if ($key === 'media_label') {
                if (! is_string($content[$key]) || mb_strlen($content[$key]) > 120 || str_contains($content[$key], '<') || str_contains($content[$key], '>')) {
                    throw new InvalidArgumentException('Invalid media label.');
                }

                $sanitized[$key] = trim($content[$key]);
                continue;
            }

            if (! is_array($content[$key])) {
                throw new InvalidArgumentException("Invalid rich content field [{$key}].");
            }

            $sanitized[$key] = $this->richContentSanitizer->sanitize($content[$key]);
        }

        return $sanitized;
    }

    private function validatedAnchor(PublicPage $page, mixed $anchor): ?string
    {
        if ($anchor === null || $anchor === '') {
            return null;
        }

        if (! is_string($anchor)) {
            throw new InvalidArgumentException('Invalid content block anchor.');
        }

        $definition = $this->registry->section($anchor);
        if (($definition['page'] ?? null) !== $page->key) {
            throw new InvalidArgumentException('Content block anchor must belong to the same public page.');
        }

        return $anchor;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function sanitizeSettings(mixed $settings): ?array
    {
        if ($settings === null) {
            return null;
        }

        if (! is_array($settings) || array_filter(array_keys($settings), 'is_int') !== []) {
            throw new InvalidArgumentException('Content block settings must be an object.');
        }

        $this->settingsItems = 0;
        $sanitized = $this->sanitizeSettingsObject($settings, 0);

        return $sanitized === [] ? null : $sanitized;
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    private function sanitizeSettingsObject(array $settings, int $depth): array
    {
        if ($depth > self::SETTINGS_MAX_DEPTH || count($settings) > self::SETTINGS_MAX_ITEMS) {
            throw new InvalidArgumentException('Content block settings are too large.');
        }

        $sanitized = [];
        foreach ($settings as $key => $value) {
            $this->settingsItems++;
            if ($this->settingsItems > self::SETTINGS_MAX_ITEMS || ! is_string($key) || mb_strlen($key) > 80) {
                throw new InvalidArgumentException('Invalid content block setting.');
            }

            if ($value === null) {
                continue;
            }

            if (is_array($value)) {
                if (array_filter(array_keys($value), 'is_int') !== []) {
                    throw new InvalidArgumentException('Content block setting arrays must be objects.');
                }

                $sanitized[$key] = $this->sanitizeSettingsObject($value, $depth + 1);
                continue;
            }

            if (! is_bool($value) && ! is_int($value) && ! is_float($value) && ! is_string($value)) {
                throw new InvalidArgumentException('Invalid content block setting value.');
            }

            if (is_string($value) && (mb_strlen($value) > 500 || str_contains($value, '<') || str_contains($value, '>'))) {
                throw new InvalidArgumentException('Unsafe content block setting value.');
            }

            $sanitized[$key] = is_string($value) ? trim($value) : $value;
        }

        return $sanitized;
    }

    /**
     * @param  array<int, string>  $allowed
     * @return array<string, mixed>
     */
    private function onlyAllowed(array $data, array $allowed): array
    {
        $unknown = array_diff(array_keys($data), $allowed);
        if ($unknown !== []) {
            throw new InvalidArgumentException('Unexpected public content fields: '.implode(', ', $unknown));
        }

        return array_intersect_key($data, array_flip($allowed));
    }

    private function sectionDefinitionForPage(PublicSection $section): array
    {
        $definition = $this->registry->section($section->key);
        if (($definition['page'] ?? null) !== $section->page->key) {
            throw new InvalidArgumentException('Public section does not belong to its registered page.');
        }

        return $definition;
    }

    private function isPublicSectionRenderable(PublicSection $section, string $pageKey): bool
    {
        if (! $section->is_visible) {
            return false;
        }

        try {
            $definition = $this->registry->section($section->key);
        } catch (InvalidArgumentException) {
            return false;
        }

        return ($definition['page'] ?? null) === $pageKey && is_string($definition['renderer'] ?? null);
    }

    private function isPublicBlockRenderable(ContentBlock $block, string $pageKey): bool
    {
        if (! $block->is_visible || ! in_array($block->layout, ContentBlock::LAYOUTS, true)) {
            return false;
        }

        if ($block->anchor_section_key === null || $block->anchor_section_key === '') {
            return true;
        }

        try {
            $definition = $this->registry->section($block->anchor_section_key);
        } catch (InvalidArgumentException) {
            return false;
        }

        return ($definition['page'] ?? null) === $pageKey;
    }

    private function forgetPageCache(PublicPage $page): void
    {
        Cache::forget("public_content.page.{$page->key}");
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function audit(string $event, mixed $target, User $actor, array $payload = []): void
    {
        $this->auditLogger->record(
            event: $event,
            payload: $payload,
            actor: $actor,
            message: $event,
            targetType: is_object($target) ? class_basename($target) : null,
            targetId: is_object($target) && method_exists($target, 'getKey') ? (string) $target->getKey() : null,
        );
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  array<int, string>  $allowedKeys
     */
    private function assertExactKeys(array $value, array $allowedKeys, string $path): void
    {
        $keys = array_keys($value);
        sort($keys);
        sort($allowedKeys);

        if ($keys !== $allowedKeys) {
            throw new InvalidArgumentException("Unexpected or missing fields at {$path}.");
        }
    }
}
