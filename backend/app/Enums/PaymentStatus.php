<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::AwaitingPayment => 'En attente de paiement',
            self::Paid => 'Payée',
            self::Failed => 'Échouée',
            self::Cancelled => 'Annulée',
            self::Refunded => 'Remboursée',
            self::Expired => 'Expirée',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::AwaitingPayment => 'badge-soft-warning',
            self::Paid => 'badge-soft-success',
            self::Failed => 'badge-soft-danger',
            self::Cancelled => 'badge-soft-secondary',
            self::Refunded => 'badge-soft-info',
            self::Expired => 'badge-soft-dark',
        };
    }

    public function isPaid(): bool
    {
        return $this === self::Paid;
    }
}
