<?php

namespace App\Notifications;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);
        $status = $this->order->status instanceof OrderStatus
            ? $this->order->status->value
            : (string) $this->order->status;

        return [
            'type' => 'order_created',
            'title' => "Commande {$orderRef} créée",
            'message' => 'Votre commande a bien été enregistrée. Finalisez le paiement pour démarrer la production.',
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'order_status' => $status,
            'action_url' => "/dashboard/orders/{$this->order->id}",
            'action_label' => 'Voir la commande',
        ];
    }
}
