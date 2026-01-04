<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ApplicationRequest extends Model
{
    protected $fillable = [
        'application_id',
        'type',
        'status',
        'request_date',
        'processed_date',
        'processed_by',
        'processing_notes',
        'created_by',
    ];

    protected $casts = [
        'type' => RequestType::class,
        'status' => RequestStatus::class,
        'request_date' => 'date',
        'processed_date' => 'date',
    ];

    // Relationships

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'processed_by');
    }

    // Child relationships (one-to-one with child tables)

    public function amendment(): HasOne
    {
        return $this->hasOne(RequestAmendment::class, 'request_id');
    }

    public function assignment(): HasOne
    {
        return $this->hasOne(RequestAssignment::class, 'request_id');
    }

    public function license(): HasOne
    {
        return $this->hasOne(RequestLicense::class, 'request_id');
    }

    public function appeal(): HasOne
    {
        return $this->hasOne(RequestAppeal::class, 'request_id');
    }

    public function complaint(): HasOne
    {
        return $this->hasOne(RequestComplaint::class, 'request_id');
    }

    public function renewal(): HasOne
    {
        return $this->hasOne(RequestRenewal::class, 'request_id');
    }

    public function termination(): HasOne
    {
        return $this->hasOne(RequestTermination::class, 'request_id');
    }

    // Attachments linked to this request

    public function attachments(): HasMany
    {
        return $this->hasMany(ApplicationAttachment::class, 'request_id');
    }

    // Fee quote for this request

    public function feeQuote(): HasOne
    {
        return $this->hasOne(FeeQuote::class, 'request_id');
    }

    // Examination records (audit trail)

    public function examinationRecords(): HasMany
    {
        return $this->hasMany(RequestExaminationRecord::class, 'request_id');
    }

    // Helper methods

    public function canEdit(): bool
    {
        return $this->status->canEdit();
    }

    public function canSubmit(): bool
    {
        return $this->status->canSubmit();
    }

    public function isPending(): bool
    {
        return $this->status->isPending();
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    /**
     * Get the detail model based on request type.
     */
    public function getDetailAttribute(): ?Model
    {
        return match ($this->type) {
            RequestType::AMENDMENT => $this->amendment,
            RequestType::ASSIGNMENT => $this->assignment,
            RequestType::LICENSE => $this->license,
            RequestType::APPEAL => $this->appeal,
            RequestType::COMPLAINT => $this->complaint,
            RequestType::RENEWAL => $this->renewal,
            RequestType::TERMINATION => $this->termination,
            default => null,
        };
    }
}
