<?php

namespace App\Policies;

use App\Models\User;

class PaymentPolicy
{
    /**
     * Les webhooks sont accessibles (la sécurité est gérée par signature).
     */
    public function handleWebhook(?User $user): bool
    {
        return true;
    }
}
