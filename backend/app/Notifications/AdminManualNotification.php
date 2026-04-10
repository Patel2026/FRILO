<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminManualNotification extends Notification
{
    use Queueable;

    /**
     * @param  array{
     *   title:string,
     *   message:string,
     *   action_url?:string|null,
     *   action_label?:string|null,
     *   sent_by_id?:int|null,
     *   sent_by_name?:string|null,
     *   audience?:string|null
     * }  $payload
     */
    public function __construct(
        private readonly array $payload,
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
        $mail = (new MailMessage)
            ->subject('FRILO — '.$this->title())
            ->greeting('Bonjour '.$notifiable->name.',')
            ->line($this->message());

        if ($this->actionUrl()) {
            $mail->action($this->actionLabel() ?? 'Ouvrir', $this->absoluteActionUrl());
        }

        return $mail->line('Message envoyé depuis le backoffice FRILO.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_manual_notification',
            'title' => $this->title(),
            'message' => $this->message(),
            'action_url' => $this->actionUrl(),
            'action_label' => $this->actionLabel(),
            'sent_by_id' => $this->payload['sent_by_id'] ?? null,
            'sent_by_name' => $this->payload['sent_by_name'] ?? null,
            'audience' => $this->payload['audience'] ?? null,
        ];
    }

    private function title(): string
    {
        return trim((string) ($this->payload['title'] ?? 'Information FRILO'));
    }

    private function message(): string
    {
        return trim((string) ($this->payload['message'] ?? ''));
    }

    private function actionUrl(): ?string
    {
        $url = $this->payload['action_url'] ?? null;
        if (! is_string($url) || trim($url) === '') {
            return null;
        }

        return trim($url);
    }

    private function actionLabel(): ?string
    {
        $label = $this->payload['action_label'] ?? null;
        if (! is_string($label) || trim($label) === '') {
            return null;
        }

        return trim($label);
    }

    private function absoluteActionUrl(): string
    {
        $actionUrl = (string) $this->actionUrl();
        if ($actionUrl === '') {
            return rtrim((string) config('app.frontend_url', env('FRONTEND_APP_URL', 'http://localhost:3000')), '/');
        }

        if (str_starts_with($actionUrl, 'http://') || str_starts_with($actionUrl, 'https://')) {
            return $actionUrl;
        }

        $frontendBaseUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_APP_URL', 'http://localhost:3000')), '/');

        return $frontendBaseUrl.'/'.ltrim($actionUrl, '/');
    }
}
