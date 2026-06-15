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

    /** Les administrateurs opérations pilotent la production des commandes. */
    public function update(User $user, Order $order): bool
    {
        return $user->hasAnyAdminRole(['ops_admin']);
    }

    /** Alias explicite pour les surfaces de production backoffice. */
    public function updateProduction(User $user, Order $order): bool
    {
        return $this->update($user, $order);
    }

    /** Suppression physique interdite. */
    public function delete(User $user, Order $order): bool
    {
        return false;
    }
}
