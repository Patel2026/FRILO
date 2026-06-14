<?php

namespace App\Models;

use App\Enums\CashEntryType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashEntry extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'type', 'amount', 'label', 'entry_date', 'notes'];

    protected $casts = [
        'type'       => CashEntryType::class,
        'amount'     => 'integer',
        'entry_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
