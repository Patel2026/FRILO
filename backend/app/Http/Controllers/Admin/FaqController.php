<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqItemRequest;
use App\Http\Requests\Admin\UpdateFaqItemRequest;
use App\Models\FaqItem;
use App\Services\FaqItemService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class FaqController extends Controller
{
    public function __construct(private readonly FaqItemService $faqItemService) {}

    public function index(Request $request): View
    {
        $this->authorize('viewAny', FaqItem::class);

        $search = trim((string) $request->string('search', ''));
        $visibility = (string) $request->string('visibility', '');

        $faqs = FaqItem::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('question', 'like', '%'.$search.'%')
                        ->orWhere('answer', 'like', '%'.$search.'%');
                });
            })
            ->when($visibility === 'published', fn ($query) => $query->where('is_published', true))
            ->when($visibility === 'hidden', fn ($query) => $query->where('is_published', false))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString();

        return view('admin.faqs.index', [
            'faqs' => $faqs,
            'filters' => [
                'search' => $search,
                'visibility' => $visibility,
            ],
        ]);
    }

    public function create(): View
    {
        $this->authorize('create', FaqItem::class);

        return view('admin.faqs.create', [
            'faq' => new FaqItem([
                'is_published' => true,
                'sort_order' => (int) (FaqItem::max('sort_order') ?? 0) + 10,
            ]),
        ]);
    }

    public function store(StoreFaqItemRequest $request): RedirectResponse
    {
        $this->authorize('create', FaqItem::class);

        $this->faqItemService->create($request->validated(), $request->user());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'Question FAQ ajoutee avec succes.');
    }

    public function edit(FaqItem $faq): View
    {
        $this->authorize('view', $faq);

        return view('admin.faqs.edit', ['faq' => $faq]);
    }

    public function update(UpdateFaqItemRequest $request, FaqItem $faq): RedirectResponse
    {
        $this->authorize('update', $faq);

        $this->faqItemService->update($faq, $request->validated(), $request->user());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'Question FAQ mise a jour.');
    }

    public function destroy(Request $request, FaqItem $faq): RedirectResponse
    {
        $this->authorize('delete', $faq);

        $this->faqItemService->delete($faq, $request->user());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'Question FAQ supprimee.');
    }
}
