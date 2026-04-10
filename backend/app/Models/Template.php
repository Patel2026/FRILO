<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
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
        'preview_pages',
        'preview_gallery',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'preview_pages' => 'array',
        'preview_gallery' => 'array',
        'is_active' => 'boolean',
        'price' => 'integer',
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
