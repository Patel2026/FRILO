<?php

namespace App\Policies;

use App\Models\ContentRevision;
use App\Models\User;

class ContentRevisionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    public function view(User $user, ContentRevision $contentRevision): bool
    {
        return $user->role === 'super_admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'super_admin';
    }

    public function update(User $user, ContentRevision $contentRevision): bool
    {
        return $user->role === 'super_admin';
    }

    public function delete(User $user, ContentRevision $contentRevision): bool
    {
        return $user->role === 'super_admin';
    }

    public function restore(User $user, ContentRevision $contentRevision): bool
    {
        return $user->role === 'super_admin';
    }
}
