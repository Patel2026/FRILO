<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\ContactRequest;
use App\Models\Order;
use App\Models\PlatformSettingRevision;
use App\Models\User;
use App\Notifications\AdminContactRequestCreatedNotification;
use App\Notifications\AdminOrderCreatedNotification;
use App\Notifications\AdminPaymentStatusUpdatedNotification;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class AdminNotificationService
{
    public function notifyOrderCreated(Order $order): void
    {
        $settings = $this->notificationSettings();
        if (! (bool) ($settings['notify_order_created'] ?? true)) {
            return;
        }

        $recipients = $this->activeSuperAdmins();
        if ($recipients->isEmpty()) {
            return;
        }

        NotificationFacade::send(
            $recipients,
            new AdminOrderCreatedNotification(
                order: $order,
                sendEmail: (bool) ($settings['email_enabled'] ?? false)
            )
        );
    }

    public function notifyContactRequestCreated(ContactRequest $contactRequest): void
    {
        $settings = $this->notificationSettings();
        if (! (bool) ($settings['notify_contact_request_received'] ?? true)) {
            return;
        }

        $recipients = $this->activeSuperAdmins();
        if ($recipients->isEmpty()) {
            return;
        }

        NotificationFacade::send(
            $recipients,
            new AdminContactRequestCreatedNotification(
                contactRequest: $contactRequest,
                sendEmail: (bool) ($settings['email_enabled'] ?? false)
            )
        );
    }

    public function notifyPaymentStatusChanged(
        Order $order,
        PaymentStatus $from,
        PaymentStatus $to
    ): void {
        $settings = $this->notificationSettings();
        if (! (bool) ($settings['notify_payment_status_changed'] ?? true)) {
            return;
        }

        $recipients = $this->activeSuperAdmins();
        if ($recipients->isEmpty()) {
            return;
        }

        NotificationFacade::send(
            $recipients,
            new AdminPaymentStatusUpdatedNotification(
                order: $order,
                from: $from,
                to: $to,
                sendEmail: (bool) ($settings['email_enabled'] ?? false)
            )
        );
    }

    public function notifyUsers(Collection $users, Notification $notification): int
    {
        if ($users->isEmpty()) {
            return 0;
        }

        NotificationFacade::send($users, $notification);

        return $users->count();
    }

    /**
     * @return Collection<int, User>
     */
    public function activeSuperAdmins(): Collection
    {
        return User::query()
            ->where('role', 'super_admin')
            ->where('is_active', true)
            ->orderBy('id')
            ->get();
    }

    private function notificationSettings(): array
    {
        $defaults = [
            'email_enabled' => true,
            'sms_enabled' => false,
            'whatsapp_enabled' => false,
            'notify_order_created' => true,
            'notify_payment_status_changed' => true,
            'notify_order_status_changed' => true,
            'notify_contact_request_received' => true,
        ];

        $published = PlatformSettingRevision::query()
            ->where('status', PlatformSettingRevision::STATUS_PUBLISHED)
            ->latest('published_at')
            ->latest('id')
            ->first();

        if (! $published) {
            return $defaults;
        }

        $payload = is_array($published->payload) ? $published->payload : [];
        $configured = Arr::get($payload, 'notifications', []);
        if (! is_array($configured)) {
            return $defaults;
        }

        return array_replace($defaults, $configured);
    }
}
