<?php

namespace App\Notifications;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly OrderStatus $from,
        private readonly OrderStatus $to
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendBaseUrl = rtrim((string) env('FRONTEND_APP_URL', 'http://localhost:3000'), '/');
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return (new MailMessage)
            ->subject("FRILO — Mise à jour de votre commande {$orderRef}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre commande {$orderRef} a été mise à jour.")
            ->line("Statut précédent : {$this->from->label()}")
            ->line("Nouveau statut : {$this->to->label()}")
            ->action('Suivre ma commande', "{$frontendBaseUrl}/dashboard/orders/{$this->order->id}")
            ->line('Merci pour votre confiance.');
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            'type' => 'order_status_updated',
            'title' => "Commande {$orderRef} mise à jour",
            'message' => sprintf(
                'Le statut est passé de "%s" à "%s".',
                $this->from->label(),
                $this->to->label()
            ),
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'from' => $this->from->value,
            'to' => $this->to->value,
            'action_url' => "/dashboard/orders/{$this->order->id}",
            'action_label' => 'Suivre ma commande',
        ];
    }
}
