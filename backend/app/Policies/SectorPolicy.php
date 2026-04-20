<?php

namespace App\Policies;

use App\Models\User;

class SectorPolicy
{
    /**
     * Les secteurs sont publics.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }
}
