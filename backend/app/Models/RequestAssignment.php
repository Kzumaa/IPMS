<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TransferType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestAssignment extends Model
{
    protected $primaryKey = 'request_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'assignor_user_id',
        'assignee_user_id',
        'transfer_type',
        'contract_number',
        'contract_date',
    ];

    protected $casts = [
        'transfer_type' => TransferType::class,
        'contract_date' => 'date',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function assignor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignor_user_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_user_id');
    }
}
