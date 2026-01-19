<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ComplaintResolution;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestComplaint extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;

    protected $fillable = [
        'request_id',
        'grounds',
        'deadline',
        'complaint_number',
        'resolved_at',
        'resolution',
    ];

    protected $casts = [
        'deadline' => 'date',
        'resolved_at' => 'date',
        'resolution' => ComplaintResolution::class,
        'complaint_number' => 'integer',
    ];

    /**
     * Get the parent request.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    /**
     * Check if the complaint has been resolved.
     */
    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    /**
     * Check if the deadline has passed.
     */
    public function isDeadlinePassed(): bool
    {
        return now()->gt($this->deadline);
    }
}
