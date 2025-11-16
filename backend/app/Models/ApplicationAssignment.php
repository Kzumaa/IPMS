<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationAssignment extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'application_id', 'staff_id', 'stage', 'status', 'assigned_by_id', 'assigned_at', 'due_date', 'completed_at', 'notes'
    ];


    protected $casts = [
        'assigned_at' => 'datetime',
        'due_date' => 'date',
        'completed_at' => 'datetime',
    ];


    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'staff_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'assigned_by_id');
    }
}
