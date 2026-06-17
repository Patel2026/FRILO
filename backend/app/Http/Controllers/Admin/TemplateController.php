<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTemplateRequest;
use App\Http\Requests\Admin\UpdateTemplateRequest;
use App\Models\Sector;
use App\Models\Template;
use App\Services\TemplateService;
use App\Support\LocalTemplatePreviewCatalog;

class TemplateController extends Controller
{
    public function __construct(
        private readonly LocalTemplatePreviewCatalog $localTemplatePreviewCatalog,
        private readonly TemplateService $templateService
    ) {}

    public function index()
    {
        $this->authorize('viewAny', Template::class);

        $templates = Template::with('sector')
            ->withCount('orders')
            ->latest()
            ->paginate(20);

        return view('admin.templates.index', compact('templates'));
    }

    public function create()
    {
        $this->authorize('create', Template::class);

        $sectors = Sector::active()->orderBy('name')->get();
        $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

        return view('admin.templates.create', compact('sectors', 'localPreviewTemplates'));
    }

    public function store(StoreTemplateRequest $request)
    {
        $this->authorize('create', Template::class);

        $this->templateService->create(
            $request->validated(),
            $request->file('thumbnail')
        );

        return redirect()->route('admin.templates.index')->with('success', 'Template créé.');
    }

    public function edit(Template $template)
    {
        $this->authorize('update', $template);

        $sectors = Sector::active()->orderBy('name')->get();
        $localPreviewTemplates = $this->localTemplatePreviewCatalog->all();

        return view('admin.templates.edit', compact('template', 'sectors', 'localPreviewTemplates'));
    }

    public function update(UpdateTemplateRequest $request, Template $template)
    {
        $this->authorize('update', $template);

        $this->templateService->update(
            $template,
            $request->validated(),
            $request->file('thumbnail')
        );

        return redirect()->route('admin.templates.index')->with('success', 'Template mis à jour.');
    }

    public function destroy(Template $template)
    {
        $this->authorize('delete', $template);

        $this->templateService->delete($template);

        return redirect()->route('admin.templates.index')->with('success', 'Template désactivé.');
    }
}
