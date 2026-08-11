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
        'normal_price',
        'promo_price',
        'features',
        'target_audience',
        'included_features',
        'thumbnail',
        'preview_url',
        'preview_pages',
        'preview_gallery',
        'color_palettes',
        'font_pairings',
        'default_color_palette',
        'default_font_pairing',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'target_audience' => 'array',
        'included_features' => 'array',
        'preview_pages' => 'array',
        'preview_gallery' => 'array',
        'color_palettes' => 'array',
        'font_pairings' => 'array',
        'is_active' => 'boolean',
        'price' => 'integer',
        'normal_price' => 'integer',
        'promo_price' => 'integer',
    ];

    protected $appends = ['full_thumbnail_url', 'effective_price'];

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(TemplateReview::class);
    }

    public function getFullThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail) {
            return null;
        }

        if (! Storage::disk('public')->exists($this->thumbnail)) {
            return null;
        }

        return Storage::url($this->thumbnail);
    }

    public function getEffectivePriceAttribute(): int
    {
        return (int) ($this->promo_price ?? $this->normal_price ?? $this->price);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
