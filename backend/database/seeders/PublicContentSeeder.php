<?php

namespace Database\Seeders;

use App\Content\PublicContentRegistry;
use App\Models\PublicPage;
use App\Models\PublicSection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PublicContentSeeder extends Seeder
{
    public function run(PublicContentRegistry $registry): void
    {
        $registry->assertValidConfiguration();

        DB::transaction(function () use ($registry): void {
            $registeredPages = [];

            foreach ($registry->pages() as $pageKey => $definition) {
                $page = PublicPage::query()->firstOrCreate(
                    ['key' => $pageKey],
                    [
                        'route_pattern' => $definition['route_pattern'],
                        'name' => $definition['name'],
                    ],
                );

                $page->update([
                    'route_pattern' => $definition['route_pattern'],
                    'name' => $definition['name'],
                ]);

                $registeredPages[$pageKey] = $page;
            }

            foreach (config('public-content.sections', []) as $sectionKey => $sectionDefinition) {
                $section = PublicSection::query()->firstOrNew(['key' => $sectionKey]);
                $content = $section->exists && is_array($section->content)
                    ? $this->reconcileContent($sectionDefinition['defaults'], $section->content)
                    : $sectionDefinition['defaults'];

                $section->fill([
                    'public_page_id' => $registeredPages[$sectionDefinition['page']]->id,
                    'name' => $sectionDefinition['name'],
                    'position' => $sectionDefinition['position'],
                    'content' => $registry->validateSectionContent($sectionKey, $content),
                ]);

                if (! $section->exists) {
                    $section->is_visible = true;
                }

                $section->save();
            }

            $this->hideRemovedSections(array_keys(config('public-content.sections', [])));
            $this->deindexRemovedPages(array_keys($registeredPages));
        });
    }

    /**
     * @param  list<string>  $registeredSectionKeys
     */
    private function hideRemovedSections(array $registeredSectionKeys): void
    {
        $removedSections = PublicSection::query();

        if ($registeredSectionKeys !== []) {
            $removedSections->whereNotIn('key', $registeredSectionKeys);
        }

        $removedSections->update(['is_visible' => false]);
    }

    /**
     * @param  list<string>  $registeredPageKeys
     */
    private function deindexRemovedPages(array $registeredPageKeys): void
    {
        $removedPages = PublicPage::query();

        if ($registeredPageKeys !== []) {
            $removedPages->whereNotIn('key', $registeredPageKeys);
        }

        $removedPageIds = (clone $removedPages)->pluck('id');

        $removedPages->update(['is_indexable' => false]);
        PublicSection::query()
            ->whereIn('public_page_id', $removedPageIds)
            ->update(['is_visible' => false]);
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $existing
     * @return array<string, mixed>
     */
    private function reconcileContent(array $defaults, array $existing): array
    {
        $content = [];

        foreach ($defaults as $key => $defaultValue) {
            $content[$key] = array_key_exists($key, $existing)
                ? $this->reconcileValue($defaultValue, $existing[$key])
                : $defaultValue;
        }

        return $content;
    }

    private function reconcileValue(mixed $default, mixed $existing): mixed
    {
        if (! is_array($default) || ! is_array($existing)) {
            return $existing;
        }

        if (array_is_list($default)) {
            if (! array_is_list($existing) || $default === [] || ! is_array($default[0])) {
                return $existing;
            }

            return array_map(
                fn (mixed $item): mixed => is_array($item)
                    ? $this->reconcileContent($default[0], $item)
                    : $item,
                $existing,
            );
        }

        if (array_is_list($existing)) {
            return $existing;
        }

        return $this->reconcileContent($default, $existing);
    }
}
