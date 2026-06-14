<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentBlockRequest;
use App\Http\Requests\Admin\UpdateContentBlockRequest;
use App\Models\ContentBlock;
use App\Models\PublicPage;
use App\Services\PublicContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ContentBlockController extends Controller
{
    public function __construct(private readonly PublicContentService $publicContentService) {}

    public function store(StoreContentBlockRequest $request, PublicPage $publicPage): RedirectResponse
    {
        $this->authorize('create', ContentBlock::class);

        try {
            $this->publicContentService->createBlock($publicPage, $request->validated(), $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['content' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.content.pages.edit', $publicPage)
            ->with('success', 'Bloc editorial ajoute.');
    }

    public function update(UpdateContentBlockRequest $request, ContentBlock $contentBlock): RedirectResponse
    {
        $this->authorize('update', $contentBlock);

        try {
            $this->publicContentService->updateBlock($contentBlock, $request->validated(), $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['content' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.content.pages.edit', $contentBlock->page)
            ->with('success', 'Bloc editorial mis a jour.');
    }

    public function destroy(Request $request, ContentBlock $contentBlock): RedirectResponse
    {
        $this->authorize('delete', $contentBlock);

        $page = $contentBlock->page;
        $this->publicContentService->deleteBlock($contentBlock, $request->user());

        return redirect()
            ->route('admin.content.pages.edit', $page)
            ->with('success', 'Bloc editorial supprime.');
    }
}
