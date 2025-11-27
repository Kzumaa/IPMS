<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'fee_quote_id',
        'amount',
        'method',
        'paid_at',
        'receipt_no',
        'payer_name',
        'receipt_file_id',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function feeQuote(): BelongsTo
    {
        return $this->belongsTo(FeeQuote::class);
    }

    public function receiptFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'receipt_file_id');
    }
}
