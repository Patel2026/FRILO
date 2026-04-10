<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemBackup extends Model
{
    public const STATUS_READY = 'ready';

    public const STATUS_RESTORED = 'restored';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'filename',
        'storage_path',
        'database_driver',
        'file_size_bytes',
        'tables_count',
        'rows_count',
        'status',
        'note',
        'meta',
        'created_by',
        'last_restored_by',
        'last_restored_at',
        'restore_count',
    ];

    protected $casts = [
        'meta' => 'array',
        'last_restored_at' => 'datetime',
        'file_size_bytes' => 'integer',
        'tables_count' => 'integer',
        'rows_count' => 'integer',
        'restore_count' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function lastRestorer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_restored_by');
    }
}
