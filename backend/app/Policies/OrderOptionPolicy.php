<?php

namespace App\Policies;

use App\Models\OrderOption;
use App\Models\User;

class OrderOptionPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(User $user, OrderOption $orderOption): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, OrderOption $orderOption): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, OrderOption $orderOption): bool
    {
        return $user->isSuperAdmin();
    }
}
