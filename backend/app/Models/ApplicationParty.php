<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationParty extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'application_id', 'role', 'user_id', 'snapshot_name', 'snapshot_address', 'snapshot_email',
        'phone', 'id_number', 'id_type', 'nationality', 'nationality_text', 'is_primary',
        'valid_from', 'valid_to', 'source_request_id'
    ];


    protected $casts = [
        'is_primary' => 'bool',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];


    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceRequest(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'source_request_id');
    }

    /**
     * Check if this party record is currently active.
     */
    public function isActive(): bool
    {
        return $this->valid_to === null;
    }
}
