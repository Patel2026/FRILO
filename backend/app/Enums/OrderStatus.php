<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Completed  = 'completed';
    case Cancelled  = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Pending    => 'En attente',
            self::Processing => 'En cours',
            self::Completed  => 'Livré',
            self::Cancelled  => 'Annulé',
        };
    }

    public function badgeClass(): string
    {
        return match($this) {
            self::Pending    => 'badge-soft-warning',
            self::Processing => 'badge-soft-info',
            self::Completed  => 'badge-soft-success',
            self::Cancelled  => 'badge-soft-danger',
        };
    }

    /** Retourne les transitions autorisées depuis ce statut. */
    public function allowedTransitions(): array
    {
        return match($this) {
            self::Pending    => [self::Processing, self::Cancelled],
            self::Processing => [self::Completed, self::Cancelled],
            self::Completed  => [],
            self::Cancelled  => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
