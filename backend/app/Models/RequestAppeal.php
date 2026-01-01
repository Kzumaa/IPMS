<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AppealResolution;
use App\Enums\AppealType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestAppeal extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'target_decision_id',
        'target_event_id',
        'appeal_type',
        'grounds',
        'deadline',
        'resolved_at',
        'resolution',
    ];

    protected $casts = [
        'appeal_type' => AppealType::class,
        'resolution' => AppealResolution::class,
        'deadline' => 'date',
        'resolved_at' => 'date',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function targetDecision(): BelongsTo
    {
        return $this->belongsTo(DecisionRecord::class, 'target_decision_id');
    }

    /**
     * Check if the appeal is within the deadline.
     */
    public function isWithinDeadline(): bool
    {
        return now()->lte($this->deadline);
    }
}
