<?php

namespace App\Policies;

use App\Models\PublicPage;
use App\Models\User;

class PublicPagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function view(User $user, PublicPage $publicPage): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function update(User $user, PublicPage $publicPage): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function delete(User $user, PublicPage $publicPage): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function restore(User $user, PublicPage $publicPage): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }
}
