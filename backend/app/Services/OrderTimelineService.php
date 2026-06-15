<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\Order;
use Illuminate\Support\Collection;

class OrderTimelineService
{
    public function forOrder(Order $order): Collection
    {
        $events = collect([
            [
                'label' => 'Commande créée',
                'description' => 'Commande enregistrée dans FRILO.',
                'date' => $order->created_at,
                'type' => 'order',
            ],
        ]);

        $order->loadMissing(['latestPayment']);

        if ($order->paid_at || $order->latestPayment?->completed_at) {
            $events->push([
                'label' => 'Paiement reçu',
                'description' => $order->latestPayment?->fedapay_reference
                    ? 'Référence '.$order->latestPayment->fedapay_reference
                    : 'Paiement confirmé.',
                'date' => $order->paid_at ?? $order->latestPayment?->completed_at,
                'type' => 'payment',
            ]);
        }

        foreach ($this->auditEvents($order) as $auditLog) {
            $events->push($this->fromAuditLog($auditLog));
        }

        if ($order->site_url && $order->status->value === 'completed') {
            $events->push([
                'label' => 'Site livré',
                'description' => $order->site_url,
                'date' => $order->updated_at,
                'type' => 'delivery',
            ]);
        }

        return $events
            ->filter(fn (array $event): bool => $event['date'] !== null)
            ->sortBy('date')
            ->values();
    }

    private function auditEvents(Order $order): Collection
    {
        return AdminAuditLog::query()
            ->with('actor')
            ->where('target_type', 'order')
            ->where('target_id', (string) $order->id)
            ->whereIn('event', [
                'order.status.changed',
                'order.production.assignment.updated',
                'order.preview_url.set',
                'order.production.client_reminder.recorded',
                'order.production.delivery.updated',
            ])
            ->oldest('id')
            ->get();
    }

    private function fromAuditLog(AdminAuditLog $auditLog): array
    {
        $payload = $auditLog->payload ?? [];

        $label = match ($auditLog->event) {
            'order.status.changed' => 'Statut changé',
            'order.production.assignment.updated' => 'Admin assigné',
            'order.preview_url.set' => 'Preview envoyée',
            'order.production.client_reminder.recorded' => 'Client relancé',
            'order.production.delivery.updated' => 'Livraison mise à jour',
            default => $auditLog->event,
        };

        $description = match ($auditLog->event) {
            'order.status.changed' => ($payload['from'] ?? '—').' → '.($payload['to'] ?? '—'),
            'order.production.assignment.updated' => $auditLog->actor?->name ?? 'Assignation interne mise à jour',
            'order.preview_url.set' => (string) ($payload['preview_url'] ?? 'Lien de prévisualisation mis à jour'),
            'order.production.client_reminder.recorded' => (string) ($payload['last_client_reminder_reason'] ?? 'Relance client enregistrée'),
            'order.production.delivery.updated' => (string) ($payload['site_url'] ?? 'Informations de livraison mises à jour'),
            default => $auditLog->message ?? '',
        };

        return [
            'label' => $label,
            'description' => $description,
            'date' => $auditLog->created_at,
            'type' => $auditLog->event,
        ];
    }
}
