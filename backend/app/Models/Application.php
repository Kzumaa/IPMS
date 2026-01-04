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
        'app_no', 'app_type', 'title', 'filing_date', 'status', 'previous_status', 'applicant_is_inventor',
        'publication_early_requested', 'pub_delay_months', 'receiving_org_id',
        'current_assignee_id', 'created_by', 'deadlines', 'file_validation_results',
        'current_version', 'origin_application_id'
    ];


    protected $casts = [
        'filing_date' => 'datetime',
        'applicant_is_inventor' => 'bool',
        'publication_early_requested' => 'bool',
        'pub_delay_months' => 'integer',
        'app_type' => AppType::class,
        'status' => ApplicationStatus::class,
        'previous_status' => ApplicationStatus::class,
        'deadlines' => 'array',
        'file_validation_results' => 'array',
        'current_version' => 'integer',
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

    public function formalityExamRecords(): HasMany
    {
        return $this->hasMany(FormalityExamRecord::class);
    }

    public function substantiveExamRecords(): HasMany
    {
        return $this->hasMany(SubstantiveExamRecord::class);
    }

    public function decisionRecords(): HasMany
    {
        return $this->hasMany(DecisionRecord::class);
    }

    public function protectionTitle(): HasOne
    {
        return $this->hasOne(ProtectionTitle::class);
    }

    /**
     * Get active (current) parties only.
     */
    public function activeParties(): HasMany
    {
        return $this->hasMany(ApplicationParty::class)->whereNull('valid_to');
    }

    // Version tracking relationships

    /**
     * Get all versions of this application.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ApplicationVersion::class);
    }

    /**
     * Get the latest version.
     */
    public function latestVersion(): HasOne
    {
        return $this->hasOne(ApplicationVersion::class)
            ->orderByDesc('version_number');
    }

    // Split application relationships

    /**
     * Get the original application this was split from.
     */
    public function originApplication(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'origin_application_id');
    }

    /**
     * Get applications that were split from this one.
     */
    public function splitApplications(): HasMany
    {
        return $this->hasMany(Application::class, 'origin_application_id');
    }
}
