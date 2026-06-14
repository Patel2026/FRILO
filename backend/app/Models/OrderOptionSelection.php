<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderOptionSelection extends Model
{
    protected $table = 'order_order_option';

    protected $fillable = [
        'order_id',
        'order_option_id',
        'name_snapshot',
        'price_snapshot',
    ];

    protected $casts = [
        'price_snapshot' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(OrderOption::class, 'order_option_id');
    }
}
