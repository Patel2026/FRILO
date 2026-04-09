<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Template extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sector_id',
        'name',
        'slug',
        'description',
        'price',
        'features',
        'thumbnail',
        'preview_url',
        'is_active',
    ];

    protected $casts = [
        'features'  => 'array',
        'is_active' => 'boolean',
        'price'     => 'integer',
    ];

    protected $appends = ['full_thumbnail_url'];

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getFullThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail) {
            return null;
        }

        return Storage::url($this->thumbnail);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
