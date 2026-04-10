<?php

namespace App\Policies;

use App\Models\TemplateReview;
use App\Models\User;

class TemplateReviewPolicy
{
    public function viewAny(?User $user = null): bool
    {
        return true;
    }

    public function view(?User $user = null, ?TemplateReview $review = null): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isClient();
    }

    public function update(User $user, TemplateReview $review): bool
    {
        return $user->id === $review->user_id;
    }

    public function moderate(User $user, TemplateReview $review): bool
    {
        return $user->isSuperAdmin();
    }
}
