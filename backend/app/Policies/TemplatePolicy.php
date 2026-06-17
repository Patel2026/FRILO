<?php

namespace App\Policies;

use App\Models\Template;
use App\Models\User;

class TemplatePolicy
{
    /**
     * Les templates sont publics.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Les templates actifs sont publics.
     */
    public function view(?User $user, Template $template): bool
    {
        return $template->is_active;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function update(User $user, Template $template): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }

    public function delete(User $user, Template $template): bool
    {
        return $user->hasAnyAdminRole(['content_admin']);
    }
}
