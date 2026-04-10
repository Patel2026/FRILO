<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'provider',
        'fedapay_transaction_id',
        'fedapay_reference',
        'payment_token',
        'checkout_url',
        'mode',
        'amount',
        'currency',
        'status',
        'last_error_code',
        'raw_payload',
        'initiated_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'raw_payload' => 'array',
        'initiated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
