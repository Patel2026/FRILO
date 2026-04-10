<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    public const STATUS_NEW = 'new';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_DONE = 'done';

    public const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_IN_PROGRESS,
        self::STATUS_DONE,
    ];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'order_reference',
        'subject',
        'message',
        'accepted_terms_at',
        'status',
        'processed_at',
    ];

    protected $casts = [
        'accepted_terms_at' => 'datetime',
        'processed_at' => 'datetime',
    ];
}
