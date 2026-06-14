<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PublicSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_page_id',
        'key',
        'name',
        'position',
        'is_visible',
        'content',
    ];

    protected $casts = [
        'position' => 'integer',
        'is_visible' => 'boolean',
        'content' => 'array',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(PublicPage::class, 'public_page_id');
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'revisionable');
    }
}
