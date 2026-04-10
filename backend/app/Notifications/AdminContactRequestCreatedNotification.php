<?php

namespace App\Notifications;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminContactRequestCreatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly ContactRequest $contactRequest,
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
        return (new MailMessage)
            ->subject('FRILO — Nouvelle demande de contact')
            ->line('Une nouvelle demande de contact vient d’être soumise.')
            ->line('Sujet: '.(string) $this->contactRequest->subject)
            ->action('Ouvrir le support', rtrim((string) config('app.url'), '/').'/admin/contact-requests');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_contact_request_created',
            'title' => 'Nouvelle demande de contact',
            'message' => 'Une nouvelle demande de support client attend un traitement.',
            'contact_request_id' => $this->contactRequest->id,
            'contact_email' => $this->contactRequest->email,
            'subject' => $this->contactRequest->subject,
            'action_url' => '/admin/contact-requests',
            'action_label' => 'Voir les demandes',
        ];
    }
}
