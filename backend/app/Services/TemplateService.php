<?php

namespace App\Services;

use App\Models\Template;
use App\Support\LocalTemplatePreviewCatalog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use League\Flysystem\UnableToWriteFile;

class TemplateService
{
    public function __construct(private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog) {}

    public function create(array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data);

        if ($thumbnail !== null) {
            $payload['thumbnail'] = $this->storeThumbnail($thumbnail);
        }

        return Template::create($payload);
    }

    public function update(Template $template, array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data, $template);
        $previousThumbnail = $template->thumbnail;

        if ($thumbnail !== null) {
            $payload['thumbnail'] = $this->storeThumbnail($thumbnail);
        }

        $template->update($payload);

        if ($thumbnail !== null && $previousThumbnail) {
            Storage::disk('public')->delete($previousThumbnail);
        }

        return $template->fresh();
    }

    public function delete(Template $template): void
    {
        $template->delete();
    }

    private function storeThumbnail(UploadedFile $thumbnail): string
    {
        try {
            $path = $thumbnail->store('templates', 'public');
        } catch (UnableToWriteFile) {
            $path = false;
        }

        if ($path === false) {
            throw ValidationException::withMessages([
                'thumbnail' => 'La miniature n’a pas pu être enregistrée. Réessayez ou contactez l’administrateur.',
            ]);
        }

        return $path;
    }

    private function normalizePayload(array $data, ?Template $template = null): array
    {
        $normalPrice = (int) $data['normal_price'];
        $promoPrice = isset($data['promo_price']) && $data['promo_price'] !== ''
            ? (int) $data['promo_price']
            : null;

        [$previewUrl, $previewPages, $previewGallery] = $this->resolvePreviewConfiguration(
            $data['preview_source'],
            $data['local_preview_template'] ?? null,
            $data['preview_url'] ?? null,
            $data['preview_pages_raw'] ?? null,
            $data['preview_gallery_raw'] ?? null
        );

        return [
            'sector_id' => (int) $data['sector_id'],
            'name' => $data['name'],
            'slug' => $template?->slug ?? Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'price' => $promoPrice ?? $normalPrice,
            'normal_price' => $normalPrice,
            'promo_price' => $promoPrice,
            'features' => $this->parseMultiline($data['features_raw'] ?? ''),
            'target_audience' => $this->parseMultiline($data['target_audience_raw'] ?? ''),
            'included_features' => $this->parseMultiline($data['included_features_raw'] ?? ''),
            'preview_url' => $previewUrl,
            'preview_mode' => $data['preview_source'] === 'local'
                ? 'iframe'
                : ($data['preview_mode'] ?? $template?->preview_mode ?? 'iframe'),
            'preview_pages' => $previewPages,
            'preview_gallery' => $previewGallery,
            'color_palettes' => $this->parseJsonList($data['color_palettes_raw'] ?? null, 'color_palettes_raw'),
            'font_pairings' => $this->parseJsonList($data['font_pairings_raw'] ?? null, 'font_pairings_raw'),
            'default_color_palette' => filled($data['default_color_palette'] ?? null)
                ? Str::limit(trim((string) $data['default_color_palette']), 80, '')
                : null,
            'default_font_pairing' => filled($data['default_font_pairing'] ?? null)
                ? Str::limit(trim((string) $data['default_font_pairing']), 80, '')
                : null,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }

    private function parseMultiline(?string $raw): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [])
        ));
    }

    private function parseJsonList(?string $raw, string $field): array
    {
        $value = trim((string) $raw);

        if ($value === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
            throw ValidationException::withMessages([
                $field => 'Le champ doit contenir un tableau JSON valide.',
            ]);
        }

        $items = [];

        foreach ($decoded as $index => $item) {
            if (! is_array($item)) {
                throw ValidationException::withMessages([
                    $field => 'Chaque entrée doit être un objet JSON.',
                ]);
            }

            $id = trim((string) ($item['id'] ?? ''));
            $name = trim((string) ($item['name'] ?? ''));

            if ($id === '' || $name === '') {
                throw ValidationException::withMessages([
                    $field => 'Chaque entrée doit contenir au minimum "id" et "name".',
                ]);
            }

            $normalized = [
                'id' => Str::limit(Str::slug($id), 80, ''),
                'name' => Str::limit($name, 120, ''),
            ];

            foreach ($item as $key => $itemValue) {
                if (in_array($key, ['id', 'name'], true)) {
                    continue;
                }

                $normalized[$key] = $itemValue;
            }

            $items[$index] = $normalized;
        }

        return array_values($items);
    }

    private function parsePreviewPages(?string $raw): array
    {
        $rows = preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [];
        $pages = [];

        foreach ($rows as $row) {
            $line = trim($row);
            if ($line === '') {
                continue;
            }

            [$label, $path] = array_pad(array_map('trim', explode('|', $line, 2)), 2, '');
            if ($label === '') {
                continue;
            }

            if ($path !== '' && ! $this->isSafePreviewLink($path, allowRelative: true)) {
                throw ValidationException::withMessages([
                    'preview_pages_raw' => 'Chaque page doit utiliser un chemin ou une URL HTTP(S) valide.',
                ]);
            }

            $pages[] = [
                'label' => Str::limit($label, 60, ''),
                'path' => $path !== '' ? Str::limit($path, 255, '') : '/',
            ];
        }

        return $pages;
    }

    private function parsePreviewGallery(?string $raw): array
    {
        $rows = preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [];
        $urls = [];

        foreach ($rows as $row) {
            $url = trim($row);
            if ($url === '') {
                continue;
            }

            if (! $this->isSafePreviewLink($url)) {
                throw ValidationException::withMessages([
                    'preview_gallery_raw' => 'Chaque image doit utiliser un chemin interne ou une URL HTTP(S) valide.',
                ]);
            }

            $urls[] = Str::limit($url, 500, '');
        }

        return $urls;
    }

    private function validatePreviewUrl(?string $previewUrl): void
    {
        if ($previewUrl === null || trim($previewUrl) === '') {
            return;
        }

        $value = trim($previewUrl);

        if ($this->isSafePreviewLink($value)) {
            return;
        }

        throw ValidationException::withMessages([
            'preview_url' => 'La prévisualisation doit être une URL http(s) ou un chemin interne commençant par /.',
        ]);
    }

    private function isSafePreviewLink(string $value, bool $allowRelative = false): bool
    {
        if (preg_match('/[\x00-\x20\x7f\\\\]/', $value) || Str::startsWith($value, '//')) {
            return false;
        }

        if (Str::startsWith($value, '/')) {
            return true;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['http', 'https'], true)
                && parse_url($value, PHP_URL_USER) === null
                && parse_url($value, PHP_URL_PASS) === null;
        }

        return $allowRelative && ! preg_match('/^[a-z][a-z0-9+.-]*:/i', $value);
    }

    private function resolvePreviewConfiguration(
        string $previewSource,
        ?string $localPreviewTemplate,
        ?string $previewUrl,
        ?string $previewPagesRaw,
        ?string $previewGalleryRaw
    ): array {
        if ($previewSource === 'local') {
            $folder = trim((string) $localPreviewTemplate);
            $match = $folder !== '' ? $this->localTemplatePreviewCatalog->find($folder) : null;

            if ($match === null) {
                throw ValidationException::withMessages([
                    'local_preview_template' => 'Selectionne un template HTML local precharge valide.',
                ]);
            }

            return [
                $match['preview_url'],
                $match['pages'],
                [],
            ];
        }

        $this->validatePreviewUrl($previewUrl);

        return [
            $previewUrl !== null ? trim($previewUrl) : null,
            $this->parsePreviewPages($previewPagesRaw),
            $this->parsePreviewGallery($previewGalleryRaw),
        ];
    }
}
