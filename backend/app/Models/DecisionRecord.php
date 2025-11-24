<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecisionRecord extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'application_id', 'decision_date', 'type', 'notes'
    ];

    protected $casts = [
        'decision_date' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
