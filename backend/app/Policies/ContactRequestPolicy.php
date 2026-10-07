<?php

namespace App\Policies;

use App\Models\ContactRequest;
use App\Models\User;

class ContactRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole(['ops_admin']);
    }

    public function update(User $user, ContactRequest $contactRequest): bool
    {
        return $this->viewAny($user);
    }

    public function deleteAny(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function restoreAny(User $user): bool
    {
        return $this->viewAny($user);
    }

    /**
     * Tout le monde peut soumettre une demande de contact.
     */
    public function create(?User $user): bool
    {
        return true;
    }
}
