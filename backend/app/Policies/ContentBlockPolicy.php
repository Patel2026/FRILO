<?php

namespace App\Policies;

use App\Models\ContentBlock;
use App\Models\User;

class ContentBlockPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function view(User $user, ContentBlock $contentBlock): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function update(User $user, ContentBlock $contentBlock): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function delete(User $user, ContentBlock $contentBlock): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function restore(User $user, ContentBlock $contentBlock): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }
}
