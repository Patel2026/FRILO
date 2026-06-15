<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClientReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly string $reason,
        private readonly string $message
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            'type' => 'client_reminder',
            'title' => "Action attendue sur {$orderRef}",
            'message' => $this->message,
            'reason' => $this->reason,
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'action_url' => "/dashboard/orders/{$this->order->id}",
            'action_label' => 'Voir ma commande',
        ];
    }
}
