<?php

namespace App\Notifications;

use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPaymentStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly PaymentStatus $from,
        private readonly PaymentStatus $to
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            'type' => 'payment_status_updated',
            'title' => "Paiement {$orderRef} mis à jour",
            'message' => sprintf(
                'Le statut de paiement est passé de "%s" à "%s".',
                $this->from->label(),
                $this->to->label()
            ),
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'payment_status_from' => $this->from->value,
            'payment_status_to' => $this->to->value,
            'action_url' => "/dashboard/orders/{$this->order->id}",
            'action_label' => 'Suivre le paiement',
        ];
    }
}
