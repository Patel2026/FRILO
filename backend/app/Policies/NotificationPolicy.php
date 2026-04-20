<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

class NotificationPolicy
{
    /**
     * Un utilisateur peut voir ses propres notifications.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DatabaseNotification $notification): bool
    {
        return (string) $user->id === (string) $notification->notifiable_id
            && $notification->notifiable_type === User::class;
    }

    public function update(User $user, DatabaseNotification $notification): bool
    {
        return $this->view($user, $notification);
    }

    public function delete(User $user, DatabaseNotification $notification): bool
    {
        return $this->view($user, $notification);
    }
}
