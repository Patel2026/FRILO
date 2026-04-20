<?php

namespace App\Policies;

use App\Models\ContactRequest;
use App\Models\User;

class ContactRequestPolicy
{
    /**
     * Tout le monde peut soumettre une demande de contact.
     */
    public function create(?User $user): bool
    {
        return true;
    }
}
