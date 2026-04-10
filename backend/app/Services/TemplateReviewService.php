<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Template;
use App\Models\TemplateReview;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TemplateReviewService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function reviewEligibility(User $user, Template $template): array
    {
        $existingReview = TemplateReview::query()
            ->where('user_id', $user->id)
            ->where('template_id', $template->id)
            ->with(['template.sector', 'user.sector'])
            ->first();

        $eligibleOrder = $this->findEligibleOrder($user, $template);

        return [
            'can_review' => $eligibleOrder !== null,
            'eligible_order' => $eligibleOrder,
            'existing_review' => $existingReview,
            'message' => $eligibleOrder
                ? 'Vous pouvez partager votre retour sur ce modèle.'
                : 'Vous devez avoir acheté ce modèle pour laisser un avis.',
        ];
    }

    public function upsertReview(User $user, Template $template, array $data): TemplateReview
    {
        $eligibleOrder = $this->findEligibleOrder($user, $template);

        if (! $eligibleOrder) {
            throw ValidationException::withMessages([
                'template' => 'Vous devez avoir acheté ce modèle avant de laisser un avis.',
            ]);
        }

        return DB::transaction(function () use ($user, $template, $eligibleOrder, $data) {
            $review = TemplateReview::query()->firstOrNew([
                'user_id' => $user->id,
                'template_id' => $template->id,
            ]);

            $review->fill([
                'order_id' => $review->order_id ?: $eligibleOrder->id,
                'rating' => (int) $data['rating'],
                'content' => trim((string) $data['content']),
                'status' => TemplateReview::STATUS_PENDING,
                'is_featured' => false,
                'featured_rank' => null,
                'approved_by' => null,
                'approved_at' => null,
            ]);

            $review->save();

            return $review->fresh(['template.sector', 'user.sector']);
        });
    }

    public function moderateReview(TemplateReview $review, array $data, User $actor): TemplateReview
    {
        return DB::transaction(function () use ($review, $data, $actor) {
            $status = (string) $data['status'];
            $isFeatured = (bool) ($data['is_featured'] ?? false);
            $featuredRank = $data['featured_rank'] ?? null;

            $payload = [
                'status' => $status,
                'is_featured' => $status === TemplateReview::STATUS_APPROVED ? $isFeatured : false,
                'featured_rank' => $status === TemplateReview::STATUS_APPROVED && $isFeatured
                    ? ($featuredRank !== null ? (int) $featuredRank : null)
                    : null,
                'approved_by' => $status === TemplateReview::STATUS_APPROVED ? $actor->id : null,
                'approved_at' => $status === TemplateReview::STATUS_APPROVED ? now() : null,
            ];

            $review->update($payload);

            $this->auditLogger->record(
                event: 'template.review.moderated',
                payload: [
                    'review_id' => $review->id,
                    'status' => $status,
                    'is_featured' => $payload['is_featured'],
                    'featured_rank' => $payload['featured_rank'],
                ],
                actor: $actor,
                message: 'Moderation avis client',
                targetType: 'template_review',
                targetId: (string) $review->id
            );

            return $review->fresh(['template.sector', 'user.sector', 'order', 'approver']);
        });
    }

    /**
     * @return Collection<int, TemplateReview>
     */
    public function featuredTestimonials(int $limit = 3): Collection
    {
        $limit = max(1, min($limit, 12));

        $featured = TemplateReview::query()
            ->approved()
            ->featured()
            ->with(['user.sector', 'template.sector'])
            ->orderByRaw('COALESCE(featured_rank, 255) asc')
            ->orderByDesc('rating')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        if ($featured->count() >= $limit) {
            return $featured;
        }

        $missing = $limit - $featured->count();

        $fallback = TemplateReview::query()
            ->approved()
            ->whereNotIn('id', $featured->pluck('id'))
            ->with(['user.sector', 'template.sector'])
            ->orderByDesc('rating')
            ->orderByDesc('approved_at')
            ->orderByDesc('created_at')
            ->limit($missing)
            ->get();

        return $featured->concat($fallback)->values();
    }

    /**
     * @return Collection<int, TemplateReview>
     */
    public function approvedReviewsForTemplate(Template $template, int $limit = 12): Collection
    {
        $limit = max(1, min($limit, 20));

        return TemplateReview::query()
            ->approved()
            ->where('template_id', $template->id)
            ->with(['user.sector', 'template.sector'])
            ->orderByDesc('is_featured')
            ->orderByRaw('COALESCE(featured_rank, 255) asc')
            ->orderByDesc('rating')
            ->orderByDesc('approved_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function approvedSummaryForTemplate(Template $template): array
    {
        $baseQuery = TemplateReview::query()
            ->approved()
            ->where('template_id', $template->id);

        $count = (int) (clone $baseQuery)->count();
        $average = $count > 0 ? round((float) (clone $baseQuery)->avg('rating'), 1) : null;

        return [
            'count' => $count,
            'average_rating' => $average,
        ];
    }

    public function findEligibleOrder(User $user, Template $template): ?Order
    {
        return Order::query()
            ->where('user_id', $user->id)
            ->where('template_id', $template->id)
            ->where(function ($query): void {
                $query
                    ->where('payment_status', PaymentStatus::Paid->value)
                    ->orWhereIn('status', [
                        OrderStatus::Processing->value,
                        OrderStatus::Completed->value,
                    ]);
            })
            ->latest('paid_at')
            ->latest('created_at')
            ->first();
    }
}
