<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestLicenseLicensee extends Model
{
    protected $table = 'request_license_licensees';

    public $timestamps = false;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'request_id',
        'licensee_user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function license(): BelongsTo
    {
        return $this->belongsTo(RequestLicense::class, 'request_id', 'request_id');
    }

    public function licensee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'licensee_user_id');
    }
}
