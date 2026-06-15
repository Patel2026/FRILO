<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderProductionService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function updateAssignment(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update([
            'production_owner_name' => $data['production_owner_name'] ?? null,
            'production_assigned_at' => $data['production_assigned_at'] ?? null,
        ]);

        $this->audit('order.production.assignment.updated', $order, $actor, $request, [
            'production_owner_name' => $order->production_owner_name,
            'production_assigned_at' => $order->production_assigned_at?->toDateTimeString(),
        ]);

        return $order->fresh();
    }

    public function updateMaterial(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.material.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateProduction(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.checklist.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateQuality(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.quality.updated', $order, $actor, $request, $data);

        return $order->fresh();
    }

    public function updateDelivery(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update($data);

        $this->audit('order.production.delivery.updated', $order, $actor, $request, [
            'site_url' => $order->site_url,
            'domain' => $order->domain,
            'hosting_expires_at' => $order->hosting_expires_at?->toDateString(),
            'delivery_ssl_checked' => $order->delivery_ssl_checked,
            'delivery_form_checked' => $order->delivery_form_checked,
            'delivery_mobile_checked' => $order->delivery_mobile_checked,
        ]);

        return $order->fresh();
    }

    public function recordReminder(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $order->update([
            'last_client_reminder_at' => now(),
            'client_reminder_count' => (int) $order->client_reminder_count + 1,
            'last_client_reminder_reason' => $data['last_client_reminder_reason'],
            'internal_follow_up_note' => $data['internal_follow_up_note'] ?? null,
        ]);

        $this->audit('order.production.client_reminder.recorded', $order, $actor, $request, [
            'client_reminder_count' => $order->client_reminder_count,
            'last_client_reminder_reason' => $order->last_client_reminder_reason,
        ]);

        return $order->fresh();
    }

    private function audit(string $event, Order $order, User $actor, ?Request $request, array $payload): void
    {
        $this->auditLogger->record(
            event: $event,
            payload: ['order_id' => $order->id] + $payload,
            actor: $actor,
            message: 'Mise a jour production commande depuis backoffice',
            targetType: 'order',
            targetId: (string) $order->id,
            request: $request
        );
    }
}
