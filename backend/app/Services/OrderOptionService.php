<?php

namespace App\Services;

use App\Models\OrderOption;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderOptionService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function create(array $data, User $actor): OrderOption
    {
        return DB::transaction(function () use ($data, $actor): OrderOption {
            $orderOption = OrderOption::create($this->normalizePayload($data));

            $this->auditLogger->record(
                event: 'order_option.created',
                payload: [
                    'order_option_id' => $orderOption->id,
                    'price' => $orderOption->price,
                    'is_active' => $orderOption->is_active,
                ],
                actor: $actor,
                message: 'Creation option de commande',
                targetType: 'order_option',
                targetId: (string) $orderOption->id
            );

            return $orderOption;
        });
    }

    public function update(OrderOption $orderOption, array $data, User $actor): OrderOption
    {
        return DB::transaction(function () use ($orderOption, $data, $actor): OrderOption {
            $orderOption->update($this->normalizePayload($data));

            $this->auditLogger->record(
                event: 'order_option.updated',
                payload: [
                    'order_option_id' => $orderOption->id,
                    'price' => $orderOption->price,
                    'is_active' => $orderOption->is_active,
                ],
                actor: $actor,
                message: 'Mise a jour option de commande',
                targetType: 'order_option',
                targetId: (string) $orderOption->id
            );

            return $orderOption->fresh();
        });
    }

    public function delete(OrderOption $orderOption, User $actor): void
    {
        DB::transaction(function () use ($orderOption, $actor): void {
            $orderOption->update(['is_active' => false]);

            $this->auditLogger->record(
                event: 'order_option.disabled',
                payload: [
                    'order_option_id' => $orderOption->id,
                    'slug' => $orderOption->slug,
                ],
                actor: $actor,
                message: 'Desactivation option de commande',
                targetType: 'order_option',
                targetId: (string) $orderOption->id
            );
        });
    }

    private function normalizePayload(array $data): array
    {
        $name = Str::squish(trim((string) $data['name']));

        return [
            'name' => $name,
            'slug' => Str::slug(trim((string) $data['slug'])),
            'description' => trim((string) ($data['description'] ?? '')),
            'persona_hint' => trim((string) ($data['persona_hint'] ?? '')),
            'price' => (int) $data['price'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }
}
