<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Un utilisateur peut voir son propre profil.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    /**
     * Un utilisateur peut modifier son propre profil.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }
}
