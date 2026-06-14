<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePublicSectionRequest;
use App\Models\PublicSection;
use App\Services\PublicContentService;
use Illuminate\Http\RedirectResponse;
use InvalidArgumentException;

class PublicSectionController extends Controller
{
    public function __construct(private readonly PublicContentService $publicContentService) {}

    public function update(UpdatePublicSectionRequest $request, PublicSection $publicSection): RedirectResponse
    {
        $this->authorize('update', $publicSection);

        try {
            $this->publicContentService->updateSection($publicSection, $request->validated(), $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['content' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.content.pages.edit', $publicSection->page)
            ->with('success', 'Section publique mise a jour.');
    }
}
