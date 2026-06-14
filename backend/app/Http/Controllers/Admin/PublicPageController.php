<?php

namespace App\Http\Controllers\Admin;

use App\Content\PublicContentRegistry;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderContentBlocksRequest;
use App\Http\Requests\Admin\UpdatePublicPageRequest;
use App\Models\PublicPage;
use App\Services\PublicContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use InvalidArgumentException;

class PublicPageController extends Controller
{
    public function __construct(
        private readonly PublicContentService $publicContentService,
        private readonly PublicContentRegistry $registry
    ) {}

    public function index(): View
    {
        $this->authorize('viewAny', PublicPage::class);

        return view('admin.content.pages.index', [
            'pages' => PublicPage::query()->orderBy('name')->paginate(20),
        ]);
    }

    public function edit(PublicPage $publicPage): View
    {
        $this->authorize('view', $publicPage);

        return view('admin.content.pages.edit', [
            'page' => $publicPage->load(['sections', 'blocks']),
            'sectionDefinitions' => $this->registry->sectionsForPage($publicPage->key),
        ]);
    }

    public function update(UpdatePublicPageRequest $request, PublicPage $publicPage): RedirectResponse
    {
        $this->authorize('update', $publicPage);

        try {
            $this->publicContentService->updatePage($publicPage, $request->validated(), $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['page' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.content.pages.edit', $publicPage)
            ->with('success', 'Page publique mise a jour.');
    }

    public function reorderBlocks(ReorderContentBlocksRequest $request, PublicPage $publicPage): RedirectResponse
    {
        $this->authorize('update', $publicPage);

        try {
            $this->publicContentService->reorderBlocks($publicPage, $request->validated('ordered_ids'), $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['ordered_ids' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.content.pages.edit', $publicPage)
            ->with('success', 'Ordre des blocs mis a jour.');
    }
}
