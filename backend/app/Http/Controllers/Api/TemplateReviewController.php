<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTemplateReviewRequest;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Services\TemplateReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateReviewController extends Controller
{
    public function __construct(private readonly TemplateReviewService $templateReviewService) {}

    public function testimonials(Request $request): JsonResponse
    {
        $this->authorize('viewAny', TemplateReview::class);

        $limit = (int) $request->integer('limit', 3);
        $reviews = $this->templateReviewService->featuredTestimonials($limit);

        return response()->json($reviews->map(fn (TemplateReview $review) => $this->transformPublicReview($review))->values());
    }

    public function indexForTemplate(int $id): JsonResponse
    {
        $this->authorize('viewAny', TemplateReview::class);

        $template = Template::active()->findOrFail($id);
        $reviews = $this->templateReviewService->approvedReviewsForTemplate($template);
        $summary = $this->templateReviewService->approvedSummaryForTemplate($template);

        return response()->json([
            'summary' => $summary,
            'data' => $reviews->map(fn (TemplateReview $review) => $this->transformPublicReview($review))->values(),
        ]);
    }

    public function eligibility(Request $request, int $id): JsonResponse
    {
        $this->authorize('create', TemplateReview::class);

        $template = Template::active()->findOrFail($id);
        $eligibility = $this->templateReviewService->reviewEligibility($request->user(), $template);
        /** @var \App\Models\TemplateReview|null $existingReview */
        $existingReview = $eligibility['existing_review'];
        /** @var \App\Models\Order|null $eligibleOrder */
        $eligibleOrder = $eligibility['eligible_order'];

        return response()->json([
            'can_review' => (bool) $eligibility['can_review'],
            'message' => (string) $eligibility['message'],
            'eligible_order_id' => $eligibleOrder?->id,
            'existing_review' => $existingReview ? [
                'id' => $existingReview->id,
                'rating' => $existingReview->rating,
                'content' => $existingReview->content,
                'status' => $existingReview->status,
                'is_featured' => (bool) $existingReview->is_featured,
                'updated_at' => optional($existingReview->updated_at)?->toISOString(),
            ] : null,
        ]);
    }

    public function store(StoreTemplateReviewRequest $request, int $id): JsonResponse
    {
        $this->authorize('create', TemplateReview::class);

        $template = Template::active()->findOrFail($id);
        $review = $this->templateReviewService->upsertReview(
            $request->user(),
            $template,
            $request->validated()
        );

        return response()->json([
            'message' => 'Votre avis a bien été enregistré. Il sera publié après validation par notre équipe.',
            'review' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'content' => $review->content,
                'status' => $review->status,
                'updated_at' => optional($review->updated_at)?->toISOString(),
            ],
        ], 201);
    }

    private function transformPublicReview(TemplateReview $review): array
    {
        $reviewerName = $review->user?->name ?? 'Client FRILO';

        return [
            'id' => $review->id,
            'rating' => (int) $review->rating,
            'content' => $review->content,
            'reviewer_name' => $reviewerName,
            'reviewer_role' => $review->user?->sector?->name
                ?? $review->template?->sector?->name
                ?? 'Client FRILO',
            'template' => $review->template ? [
                'id' => $review->template->id,
                'name' => $review->template->name,
                'slug' => $review->template->slug,
            ] : null,
            'created_at' => optional($review->created_at)?->toISOString(),
            'approved_at' => optional($review->approved_at)?->toISOString(),
            'is_featured' => (bool) $review->is_featured,
        ];
    }
}
