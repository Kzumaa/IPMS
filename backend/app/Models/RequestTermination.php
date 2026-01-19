<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestTermination extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;

    protected $fillable = [
        'request_id',
        'reason',
        'effective_date',
    ];

    protected $casts = [
        'effective_date' => 'date',
    ];

    /**
     * Get the parent request.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }
}
