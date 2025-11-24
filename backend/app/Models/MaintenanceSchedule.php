<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceSchedule extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'protection_title_id', 'year', 'due_date', 'amount', 'status', 'paid_at'
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function protectionTitle(): BelongsTo
    {
        return $this->belongsTo(ProtectionTitle::class);
    }
}
