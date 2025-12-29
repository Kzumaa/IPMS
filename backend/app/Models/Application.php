<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use App\Enums\AppType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;
    protected $fillable = [
        'app_no', 'app_type', 'title', 'filing_date', 'status', 'applicant_is_inventor',
        'publication_early_requested', 'pub_delay_months', 'receiving_org_id',
        'current_assignee_id', 'created_by', 'deadlines', 'file_validation_results'
    ];


    protected $casts = [
        'filing_date' => 'date',
        'applicant_is_inventor' => 'bool',
        'publication_early_requested' => 'bool',
        'pub_delay_months' => 'integer',
        'app_type' => AppType::class,
        'status' => ApplicationStatus::class,
        'deadlines' => 'array',
        'file_validation_results' => 'array',
    ];


    public function receivingOrg(): BelongsTo
    {
        return $this->belongsTo(AuthorityOrg::class, 'receiving_org_id');
    }

    public function currentAssignee(): BelongsTo
    {
        return $this->belongsTo(AuthorityStaff::class, 'current_assignee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    public function parties(): HasMany
    {
        return $this->hasMany(ApplicationParty::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ApplicationAssignment::class);
    }

    public function metrics(): HasOne
    {
        return $this->hasOne(ApplicationMetric::class, 'application_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ApplicationAttachment::class);
    }

    public function priorityClaims(): HasMany
    {
        return $this->hasMany(PriorityClaim::class);
    }

    public function ipcClasses(): HasMany
    {
        return $this->hasMany(IpcClass::class);
    }

    public function locarnoClasses(): HasMany
    {
        return $this->hasMany(LocarnoClass::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function feeQuotes(): HasMany
    {
        return $this->hasMany(FeeQuote::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ApplicationRequest::class);
    }

    /**
     * Get active (current) parties only.
     */
    public function activeParties(): HasMany
    {
        return $this->hasMany(ApplicationParty::class)->whereNull('valid_to');
    }
}
