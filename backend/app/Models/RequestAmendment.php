<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AmendmentSection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RequestAmendment extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'section',
        'change_summary',
        'field_name',
        'old_value',
        'new_value',
        'pending_version_id',
    ];

    protected $casts = [
        'section' => AmendmentSection::class,
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function pendingVersion(): BelongsTo
    {
        return $this->belongsTo(ApplicationPendingVersion::class, 'pending_version_id');
    }

    /**
     * Check if this amendment has a pending version (edit-mode amendment).
     */
    public function hasPendingVersion(): bool
    {
        return $this->pending_version_id !== null;
    }
}
