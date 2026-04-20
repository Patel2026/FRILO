<?php

namespace App\Policies;

use App\Models\FaqItem;
use App\Models\User;

class FaqItemPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(User $user, FaqItem $faqItem): bool
    {
        return $user->isSuperAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, FaqItem $faqItem): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, FaqItem $faqItem): bool
    {
        return $user->isSuperAdmin();
    }
}
