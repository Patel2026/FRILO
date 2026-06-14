<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use App\Models\ContentRevision;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Services\ContentRevisionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use InvalidArgumentException;

class ContentRevisionController extends Controller
{
    public function __construct(private readonly ContentRevisionService $contentRevisionService) {}

    public function index(): View
    {
        $this->authorize('viewAny', ContentRevision::class);

        return view('admin.content.history.index', [
            'revisions' => ContentRevision::query()
                ->with(['actor', 'revisionable'])
                ->latest('created_at')
                ->paginate(30),
        ]);
    }

    public function restore(Request $request, ContentRevision $contentRevision): RedirectResponse
    {
        $this->authorize('restore', $contentRevision);

        try {
            $restored = $this->contentRevisionService->restore($contentRevision, $request->user());
        } catch (InvalidArgumentException $exception) {
            return back()->withErrors(['revision' => $exception->getMessage()]);
        }

        return redirect()
            ->route('admin.content.pages.edit', $this->pageForRestoredModel($restored))
            ->with('success', 'Version restauree.');
    }

    private function pageForRestoredModel(Model $model): PublicPage
    {
        return match ($model::class) {
            PublicPage::class => $model,
            PublicSection::class, ContentBlock::class => $model->loadMissing('page')->page,
            default => throw new InvalidArgumentException('Ressource restauree inconnue.'),
        };
    }
}
