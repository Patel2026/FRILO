<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
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

        return view('admin.templates.create', compact('sectors'));
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
            'preview_url' => ['nullable', 'url', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $data['features'] = $this->parseFeatures($request->input('features_raw'));
        $data['preview_pages'] = $this->parsePreviewPages($request->input('preview_pages_raw'));
        $data['preview_gallery'] = $this->parsePreviewGallery($request->input('preview_gallery_raw'));
        $data['is_active'] = $request->boolean('is_active');
        unset($data['features_raw'], $data['preview_pages_raw'], $data['preview_gallery_raw']);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('templates', 'public');
        }

        Template::create($data);

        return redirect()->route('admin.templates.index')->with('success', 'Template créé.');
    }

    public function edit(Template $template)
    {
        $sectors = Sector::active()->orderBy('name')->get();

        return view('admin.templates.edit', compact('template', 'sectors'));
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
            'preview_url' => ['nullable', 'url', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $data['features'] = $this->parseFeatures($request->input('features_raw'));
        $data['preview_pages'] = $this->parsePreviewPages($request->input('preview_pages_raw'));
        $data['preview_gallery'] = $this->parsePreviewGallery($request->input('preview_gallery_raw'));
        $data['is_active'] = $request->boolean('is_active');
        unset($data['features_raw'], $data['preview_pages_raw'], $data['preview_gallery_raw']);

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
}
