<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestRenewal extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;

    protected $fillable = [
        'request_id',
        'renewal_years',
        'current_expiration_date',
        'new_expiration_date',
    ];

    protected $casts = [
        'current_expiration_date' => 'date',
        'new_expiration_date' => 'date',
        'renewal_years' => 'integer',
    ];

    /**
     * Get the parent request.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }
}
