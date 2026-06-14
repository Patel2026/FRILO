<?php

namespace App\Policies;

use App\Models\ClientContact;
use App\Models\User;

class ClientContactPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }

    public function delete(User $user, ClientContact $contact): bool
    {
        return $contact->user_id === $user->id;
    }
}
