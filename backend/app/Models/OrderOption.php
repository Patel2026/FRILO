<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'persona_hint',
        'price',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_order_option')
            ->withPivot(['name_snapshot', 'price_snapshot'])
            ->withTimestamps();
    }
}
