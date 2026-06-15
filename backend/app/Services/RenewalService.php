<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RenewalService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function recordReminder(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order = DB::transaction(function () use ($order, $data): Order {
            $order->newQuery()
                ->whereKey($order->getKey())
                ->update([
                    'hosting_renewal_status' => 'reminded',
                    'hosting_renewal_last_reminder_at' => now(),
                    'hosting_renewal_reminder_count' => DB::raw('hosting_renewal_reminder_count + 1'),
                    'hosting_renewal_note' => $data['hosting_renewal_note'] ?? null,
                    'updated_at' => now(),
                ]);

            return $order->fresh();
        });

        $this->auditLogger->record(
            event: 'order.hosting_renewal.reminded',
            payload: ['order_id' => $order->id, 'count' => $order->hosting_renewal_reminder_count],
            actor: $actor,
            message: 'Relance renouvellement hebergement',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );

        return $order;
    }

    public function markPaid(Order $order, User $actor, ?Request $request = null): Order
    {
        $order->update([
            'hosting_renewal_status' => 'paid',
            'hosting_renewal_paid_at' => now(),
        ]);

        $this->auditLogger->record(
            event: 'order.hosting_renewal.paid',
            payload: ['order_id' => $order->id],
            actor: $actor,
            message: 'Renouvellement hebergement marque paye',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );

        return $order->fresh();
    }
}
