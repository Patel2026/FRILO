<?php

namespace App\Notifications;

use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminPaymentStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly PaymentStatus $from,
        private readonly PaymentStatus $to,
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
            ->subject("FRILO — Paiement mis à jour {$orderRef}")
            ->line("Le paiement de la commande {$orderRef} a changé de statut.")
            ->line("Statut précédent: {$this->from->label()}")
            ->line("Nouveau statut: {$this->to->label()}")
            ->action('Voir la commande', rtrim((string) config('app.url'), '/')."/admin/orders/{$this->order->id}");
    }

    public function toArray(object $notifiable): array
    {
        $orderRef = '#ORD-'.str_pad((string) $this->order->id, 5, '0', STR_PAD_LEFT);

        return [
            'type' => 'admin_payment_status_updated',
            'title' => "Paiement mis à jour {$orderRef}",
            'message' => sprintf(
                'Le paiement est passé de "%s" à "%s".',
                $this->from->label(),
                $this->to->label()
            ),
            'order_id' => $this->order->id,
            'order_reference' => $orderRef,
            'payment_status_from' => $this->from->value,
            'payment_status_to' => $this->to->value,
            'action_url' => "/admin/orders/{$this->order->id}",
            'action_label' => 'Voir la commande',
        ];
    }
}
