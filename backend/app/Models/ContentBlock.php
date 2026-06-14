<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ContentBlock extends Model
{
    use HasFactory;

    public const LAYOUT_FULL_WIDTH = 'full_width';

    public const LAYOUT_TWO_COLUMNS = 'two_columns';

    public const LAYOUT_MEDIA_TEXT = 'media_text';

    public const LAYOUTS = [
        self::LAYOUT_FULL_WIDTH,
        self::LAYOUT_TWO_COLUMNS,
        self::LAYOUT_MEDIA_TEXT,
    ];

    protected $fillable = [
        'public_page_id',
        'anchor_section_key',
        'position',
        'layout',
        'content',
        'settings',
        'is_visible',
    ];

    protected $casts = [
        'position' => 'integer',
        'content' => 'array',
        'settings' => 'array',
        'is_visible' => 'boolean',
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
