<?php

namespace App\Services;

use App\Models\FaqItem;
use App\Models\Sector;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CatalogSelectionService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function apply(string $model, array $ids, string $action, User $actor, ?bool $active = null): int
    {
        abort_unless(in_array($model, [Template::class, FaqItem::class, Sector::class], true), 404);
        abort_unless($model === Sector::class ? $action === 'visibility' : in_array($action, ['delete', 'restore'], true), 422);

        return DB::transaction(function () use ($model, $ids, $action, $actor, $active): int {
            $items = $model::query()
                ->when($action === 'restore', fn ($query) => $query->onlyTrashed())
                ->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();
            if ($items->count() !== count($ids)) {
                throw ValidationException::withMessages(['ids' => 'La sélection a changé. Rechargez la liste et réessayez.']);
            }
            foreach ($items as $item) {
                match ($action) {
                    'delete' => $item->delete(),
                    'restore' => $item->restore(),
                    'visibility' => $item->update(['is_active' => $active]),
                };
                $type = match ($model) {
                    Template::class => 'template', FaqItem::class => 'faq', Sector::class => 'sector'
                };
                $this->auditLogger->record(
                    event: $type.'.'.match ($action) {
                        'delete' => 'deleted', 'restore' => 'restored', default => $active ? 'activated' : 'deactivated'
                    },
                    payload: ['id' => $item->id, 'bulk' => true],
                    actor: $actor,
                    targetType: $model === FaqItem::class ? 'faq_item' : $type,
                    targetId: (string) $item->id,
                );
            }

            return $items->count();
        });
    }
}
