<?php

namespace App\Services;

use App\Models\Template;
use App\Support\LocalTemplatePreviewCatalog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TemplateService
{
    public function __construct(private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog) {}

    public function create(array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data);

        if ($thumbnail !== null) {
            $payload['thumbnail'] = $thumbnail->store('templates', 'public');
        }

        return Template::create($payload);
    }

    public function update(Template $template, array $data, ?UploadedFile $thumbnail = null): Template
    {
        $payload = $this->normalizePayload($data, $template);

        if ($thumbnail !== null) {
            if ($template->thumbnail) {
                Storage::disk('public')->delete($template->thumbnail);
            }

            $payload['thumbnail'] = $thumbnail->store('templates', 'public');
        }

        $template->update($payload);

        return $template->fresh();
    }

    public function delete(Template $template): void
    {
        $template->delete();
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
            'preview_pages' => $previewPages,
            'preview_gallery' => $previewGallery,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }

    private function parseMultiline(?string $raw): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $raw ?? '') ?: [])
        ));
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

            if (Str::startsWith($url, '/') || filter_var($url, FILTER_VALIDATE_URL)) {
                $urls[] = Str::limit($url, 500, '');
            }
        }

        return $urls;
    }

    private function validatePreviewUrl(?string $previewUrl): void
    {
        if ($previewUrl === null || trim($previewUrl) === '') {
            return;
        }

        $value = trim($previewUrl);

        if (Str::startsWith($value, '/') || filter_var($value, FILTER_VALIDATE_URL)) {
            return;
        }

        throw ValidationException::withMessages([
            'preview_url' => 'La prévisualisation doit être une URL http(s) ou un chemin interne commençant par /.',
        ]);
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
