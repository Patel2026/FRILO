<?php

namespace App\Services;

use App\Models\FaqItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FaqItemService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    /**
     * @return Collection<int, FaqItem>
     */
    public function publishedFaqs(?int $limit = null): Collection
    {
        $query = FaqItem::query()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($limit !== null) {
            $query->limit(max(1, min($limit, 20)));
        }

        return $query->get();
    }

    public function create(array $data, User $actor): FaqItem
    {
        return DB::transaction(function () use ($data, $actor) {
            $faqItem = FaqItem::create($this->normalizePayload($data));

            $this->auditLogger->record(
                event: 'faq.created',
                payload: [
                    'faq_id' => $faqItem->id,
                    'is_published' => $faqItem->is_published,
                    'sort_order' => $faqItem->sort_order,
                ],
                actor: $actor,
                message: 'Creation FAQ',
                targetType: 'faq_item',
                targetId: (string) $faqItem->id
            );

            return $faqItem;
        });
    }

    public function update(FaqItem $faqItem, array $data, User $actor): FaqItem
    {
        return DB::transaction(function () use ($faqItem, $data, $actor) {
            $faqItem->update($this->normalizePayload($data));

            $this->auditLogger->record(
                event: 'faq.updated',
                payload: [
                    'faq_id' => $faqItem->id,
                    'is_published' => $faqItem->is_published,
                    'sort_order' => $faqItem->sort_order,
                ],
                actor: $actor,
                message: 'Mise a jour FAQ',
                targetType: 'faq_item',
                targetId: (string) $faqItem->id
            );

            return $faqItem->fresh();
        });
    }

    public function delete(FaqItem $faqItem, User $actor): void
    {
        DB::transaction(function () use ($faqItem, $actor) {
            $faqId = $faqItem->id;
            $question = $faqItem->question;
            $faqItem->delete();

            $this->auditLogger->record(
                event: 'faq.deleted',
                payload: [
                    'faq_id' => $faqId,
                    'question' => $question,
                ],
                actor: $actor,
                message: 'Suppression FAQ',
                targetType: 'faq_item',
                targetId: (string) $faqId
            );
        });
    }

    private function normalizePayload(array $data): array
    {
        return [
            'question' => Str::squish(trim((string) $data['question'])),
            'answer' => trim((string) $data['answer']),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_published' => (bool) ($data['is_published'] ?? false),
        ];
    }
}
