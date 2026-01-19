<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LicenseType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestLicense extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'licensor_user_id',
        'license_type',
        'scope_territory',
        'scope_products',
        'valid_from',
        'valid_to',
        'contract_number',
    ];

    protected $casts = [
        'license_type' => LicenseType::class,
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function licensor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'licensor_user_id');
    }

    public function licensees(): HasMany
    {
        return $this->hasMany(RequestLicenseLicensee::class, 'request_id', 'request_id');
    }
}
