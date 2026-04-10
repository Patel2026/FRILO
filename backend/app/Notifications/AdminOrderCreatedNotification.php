<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminOrderCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly bool $sendEmail = false
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];
        if ($this->sendEmail) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return (new MailMessage)
            ->subject("FRILO — Nouvelle commande {$orderRef}")
            ->line("Une nouvelle commande {$orderRef} vient d'être créée.")
            ->action('Voir la commande', rtrim((string) config('app.url'), '/')."/admin/orders/{$this->order->id}");
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            'type' => 'admin_order_created',
            'title' => "Nouvelle commande {$orderRef}",
            'message' => 'Un client a créé une nouvelle commande. Vérifie la prise en charge.',
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'action_url' => "/admin/orders/{$this->order->id}",
            'action_label' => 'Ouvrir la commande',
        ];
    }
}
