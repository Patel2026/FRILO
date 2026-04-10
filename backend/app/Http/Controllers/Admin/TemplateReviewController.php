<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateTemplateReviewRequest;
use App\Models\TemplateReview;
use App\Services\TemplateReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TemplateReviewController extends Controller
{
    public function __construct(private readonly TemplateReviewService $templateReviewService) {}

    public function index(Request $request): View
    {
        $status = (string) $request->string('status', '');
        $featured = (string) $request->string('featured', '');
        $search = trim((string) $request->string('search', ''));

        $reviews = TemplateReview::query()
            ->with(['user.sector', 'template.sector', 'order', 'approver'])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($featured === 'yes', fn ($query) => $query->where('is_featured', true))
            ->when($featured === 'no', fn ($query) => $query->where('is_featured', false))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('content', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery
                                ->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        })
                        ->orWhereHas('template', function ($templateQuery) use ($search): void {
                            $templateQuery->where('name', 'like', '%'.$search.'%');
                        });
                });
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return view('admin.reviews.index', [
            'reviews' => $reviews,
            'statuses' => TemplateReview::STATUSES,
            'filters' => [
                'status' => $status,
                'featured' => $featured,
                'search' => $search,
            ],
        ]);
    }

    public function update(UpdateTemplateReviewRequest $request, TemplateReview $review): RedirectResponse
    {
        $this->authorize('moderate', $review);

        $this->templateReviewService->moderateReview(
            $review,
            $request->validated(),
            $request->user()
        );

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Avis client mis a jour.');
    }
}
