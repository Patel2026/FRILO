<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PublicPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'route_pattern',
        'name',
        'seo_title',
        'seo_description',
        'is_indexable',
    ];

    protected $casts = [
        'is_indexable' => 'boolean',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(PublicSection::class)->orderBy('position')->orderBy('id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(ContentBlock::class)->orderBy('position')->orderBy('id');
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'revisionable');
    }
}
