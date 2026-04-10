<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClientResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $expire = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');
        $frontendBaseUrl = rtrim((string) env('FRONTEND_APP_URL', 'http://localhost:3000'), '/');
        $email = urlencode((string) $notifiable->getEmailForPasswordReset());
        $token = urlencode($this->token);
        $url = "{$frontendBaseUrl}/reset-password?token={$token}&email={$email}";

        return (new MailMessage)
            ->subject('FRILO — Réinitialisation de votre mot de passe')
            ->greeting("Bonjour {$notifiable->name},")
            ->line('Vous avez demandé la réinitialisation de votre mot de passe FRILO.')
            ->action('Réinitialiser mon mot de passe', $url)
            ->line("Ce lien expirera dans {$expire} minutes.")
            ->line('Si vous n’êtes pas à l’origine de cette demande, aucune action n’est nécessaire.');
    }
}
