<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderInstruction extends Model
{
    protected $fillable = [
        'order_id',
        'enterprise_name',
        'activity_description',
        'colors',
        'specific_instructions',
    ];

    protected $casts = [
        'colors' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
