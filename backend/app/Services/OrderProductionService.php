<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Notifications\ClientReminderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderProductionService
{
    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function updateAssignment(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $clientManagerName = isset($data['client_manager_id'])
            ? User::query()->find($data['client_manager_id'])?->name
            : null;

        $order->update([
            'client_manager_id' => $data['client_manager_id'] ?? null,
            'technician_id' => $data['technician_id'] ?? null,
            'quality_validator_id' => $data['quality_validator_id'] ?? null,
            'production_owner_name' => $data['production_owner_name'] ?? $clientManagerName,
            'production_assigned_at' => $data['production_assigned_at'] ?? null,
        ]);

        $this->audit('order.production.assignment.updated', $order, $actor, $request, [
            'client_manager_id' => $order->client_manager_id,
            'technician_id' => $order->technician_id,
            'quality_validator_id' => $order->quality_validator_id,
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
            'delivery_access_transferred' => $order->delivery_access_transferred,
        ]);

        return $order->fresh();
    }

    public function recordReminder(Order $order, array $data, User $actor, ?Request $request = null): Order
    {
        $message = trim((string) ($data['last_client_reminder_message'] ?? ''));
        if ($message === '') {
            $message = 'Bonjour, merci de nous transmettre les éléments manquants pour avancer sur votre site FRILO.';
        }

        $order = DB::transaction(function () use ($order, $data, $message): Order {
            $order->newQuery()
                ->whereKey($order->getKey())
                ->update([
                    'last_client_reminder_at' => now(),
                    'client_reminder_count' => DB::raw('client_reminder_count + 1'),
                    'last_client_reminder_reason' => $data['last_client_reminder_reason'],
                    'last_client_reminder_message' => $message,
                    'internal_follow_up_note' => $data['internal_follow_up_note'] ?? null,
                    'updated_at' => now(),
                ]);

            return $order->fresh();
        });

        $this->audit('order.production.client_reminder.recorded', $order, $actor, $request, [
            'client_reminder_count' => $order->client_reminder_count,
            'last_client_reminder_reason' => $order->last_client_reminder_reason,
        ]);

        $order->loadMissing('user');
        if ($order->user?->isClient()) {
            $order->user->notify(new ClientReminderNotification(
                $order,
                (string) $order->last_client_reminder_reason,
                (string) $order->last_client_reminder_message
            ));
        }

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
