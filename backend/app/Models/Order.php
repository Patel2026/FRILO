<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'preview_url',
        'client_feedback',
        'feedback_submitted_at',
        'site_url',
        'domain',
        'hosting_expires_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'price' => 'integer',
        'paid_at' => 'datetime',
        'feedback_submitted_at' => 'datetime',
        'hosting_expires_at' => 'date',
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

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(OrderOption::class, 'order_order_option')
            ->withPivot(['name_snapshot', 'price_snapshot'])
            ->withTimestamps();
    }

    public function optionSelections(): HasMany
    {
        return $this->hasMany(OrderOptionSelection::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(PaymentTransaction::class)->latestOfMany();
    }

    public function templateReview(): HasOne
    {
        return $this->hasOne(TemplateReview::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
