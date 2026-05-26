<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\Template;
use App\Support\LocalTemplatePreviewCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    public function __construct(
        private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog
    ) {
    }

    public function index()
    {
        $templates = Template::with('sector')
            ->withCount('orders')
            ->latest()
            ->paginate(20);

        return view('admin.templates.index', compact('templates'));
    }

    public function create()
    {
        $sectors = Sector::active()->orderBy('name')->get();
        $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

        return view('admin.templates.create', compact('sectors', 'localPreviewTemplates'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sector_id' => ['required', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'features_raw' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'preview_source' => ['required', 'in:external,local'],
            'local_preview_template' => ['nullable', 'string', 'max:255'],
            'preview_url' => ['nullable', 'string', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $data['features'] = $this->parseFeatures($request->input('features_raw'));
        [$data['preview_url'], $data['preview_pages'], $data['preview_gallery']] = $this->resolvePreviewConfiguration(
            $data['preview_source'],
            $request->input('local_preview_template'),
            $data['preview_url'] ?? null,
            $request->input('preview_pages_raw'),
            $request->input('preview_gallery_raw')
        );
        $data['is_active'] = $request->boolean('is_active');
        unset($data['features_raw'], $data['preview_source'], $data['local_preview_template'], $data['preview_pages_raw'], $data['preview_gallery_raw']);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('templates', 'public');
        }

        Template::create($data);

        return redirect()->route('admin.templates.index')->with('success', 'Template créé.');
    }

    public function edit(Template $template)
    {
        $sectors = Sector::active()->orderBy('name')->get();
        $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

        return view('admin.templates.edit', compact('template', 'sectors', 'localPreviewTemplates'));
    }

    public function update(Request $request, Template $template)
    {
        $data = $request->validate([
            'sector_id' => ['required', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'features_raw' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'preview_source' => ['required', 'in:external,local'],
            'local_preview_template' => ['nullable', 'string', 'max:255'],
            'preview_url' => ['nullable', 'string', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['features'] = $this->parseFeatures($request->input('features_raw'));
        [$data['preview_url'], $data['preview_pages'], $data['preview_gallery']] = $this->resolvePreviewConfiguration(
            $data['preview_source'],
            $request->input('local_preview_template'),
            $data['preview_url'] ?? null,
            $request->input('preview_pages_raw'),
            $request->input('preview_gallery_raw')
        );
        $data['is_active'] = $request->boolean('is_active');
        unset($data['features_raw'], $data['preview_source'], $data['local_preview_template'], $data['preview_pages_raw'], $data['preview_gallery_raw']);

        if ($request->hasFile('thumbnail')) {
            if ($template->thumbnail) {
                Storage::disk('public')->delete($template->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('templates', 'public');
        }

        $template->update($data);

        return redirect()->route('admin.templates.index')->with('success', 'Template mis à jour.');
    }

    public function destroy(Template $template)
    {
        $template->delete(); // soft delete

        return redirect()->route('admin.templates.index')->with('success', 'Template désactivé.');
    }

    private function parseFeatures(?string $raw): array
    {
        $raw ??= '';

        return array_values(array_filter(
            array_map('trim', explode("\n", $raw))
        ));
    }

    /**
     * Format attendu : une ligne par page, "Label|/path".
     */
    private function parsePreviewPages(?string $raw): array
    {
        $raw ??= '';
        $rows = preg_split('/\r\n|\r|\n/', $raw) ?: [];
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

    /**
     * Format attendu : une URL d'image par ligne.
     */
    private function parsePreviewGallery(?string $raw): array
    {
        $raw ??= '';
        $rows = preg_split('/\r\n|\r|\n/', $raw) ?: [];
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

        if (Str::startsWith($value, '/')) {
            return;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
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
