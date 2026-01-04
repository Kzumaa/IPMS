<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestExaminationRecord extends Model
{
    protected $fillable = [
        'request_id',
        'examined_by',
        'action',
        'notes',
        'examined_at',
    ];

    protected $casts = [
        'examined_at' => 'datetime',
    ];

    // Relationships

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function examiner(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'examined_by');
    }
}
