<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /** Un client peut lister ses propres commandes. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /** Un client ne peut voir que ses propres commandes. */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id;
    }

    /** Tout client authentifié peut créer une commande. */
    public function create(User $user): bool
    {
        return true;
    }

    /** Seul un admin peut modifier une commande. */
    public function update(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    /** Suppression physique interdite. */
    public function delete(User $user, Order $order): bool
    {
        return false;
    }
}
