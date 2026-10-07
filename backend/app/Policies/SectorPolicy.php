<?php

namespace App\Policies;

use App\Models\User;

class SectorPolicy
{
    public function manageSelection(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    /**
     * Les secteurs sont publics.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }
}
