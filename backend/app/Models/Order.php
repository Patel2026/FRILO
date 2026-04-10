<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'template_id',
        'status',
        'payment_status',
        'price',
        'paid_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'price' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class)->withTrashed();
    }

    public function instruction(): HasOne
    {
        return $this->hasOne(OrderInstruction::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(PaymentTransaction::class)->latestOfMany();
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
