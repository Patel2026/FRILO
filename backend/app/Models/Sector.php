<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sector extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'gradient',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
