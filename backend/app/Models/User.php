<?php

namespace App\Models;

use App\Notifications\ClientResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_CLIENT = 'client';

    public const ROLE_SUPER_ADMIN = 'super_admin';

    public const ROLE_OPS_ADMIN = 'ops_admin';

    public const ROLE_CONTENT_ADMIN = 'content_admin';

    public const ROLE_FINANCE_ADMIN = 'finance_admin';

    public const ADMIN_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_OPS_ADMIN,
        self::ROLE_CONTENT_ADMIN,
        self::ROLE_FINANCE_ADMIN,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'sector_id',
        'avatar',
        'fedapay_customer_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'fedapay_customer_id' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function clientContacts(): HasMany
    {
        return $this->hasMany(ClientContact::class);
    }

    public function templateReviews(): HasMany
    {
        return $this->hasMany(TemplateReview::class);
    }

    public function cashEntries(): HasMany
    {
        return $this->hasMany(CashEntry::class);
    }

    public function deadlines(): HasMany
    {
        return $this->hasMany(Deadline::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, self::ADMIN_ROLES, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isOpsAdmin(): bool
    {
        return $this->role === self::ROLE_OPS_ADMIN;
    }

    public function isContentAdmin(): bool
    {
        return $this->role === self::ROLE_CONTENT_ADMIN;
    }

    public function isFinanceAdmin(): bool
    {
        return $this->role === self::ROLE_FINANCE_ADMIN;
    }

    public function hasAnyAdminRole(array $roles): bool
    {
        return $this->isSuperAdmin() || in_array($this->role, $roles, true);
    }

    public function isClient(): bool
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ClientResetPasswordNotification($token));
    }
}
