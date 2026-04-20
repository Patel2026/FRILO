<?php

namespace App\Policies;

use App\Models\User;

class PlatformSettingPolicy
{
    /**
     * Les tarifs sont publics.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }
}
