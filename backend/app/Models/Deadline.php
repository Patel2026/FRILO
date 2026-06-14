<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deadline extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'title', 'description', 'due_date', 'is_system'];

    protected $casts = [
        'due_date'  => 'date',
        'is_system' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDaysRemainingAttribute(): int
    {
        return (int) now()->startOfDay()->diffInDays(
            $this->due_date->copy()->startOfDay(),
            false
        );
    }
}
