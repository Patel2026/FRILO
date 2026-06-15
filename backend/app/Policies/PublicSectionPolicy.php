<?php

namespace App\Policies;

use App\Models\PublicSection;
use App\Models\User;

class PublicSectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function view(User $user, PublicSection $publicSection): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function update(User $user, PublicSection $publicSection): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function delete(User $user, PublicSection $publicSection): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function restore(User $user, PublicSection $publicSection): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }
}
