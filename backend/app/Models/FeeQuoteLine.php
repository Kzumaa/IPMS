<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeQuoteLine extends Model
{
    public $timestamps = false;
    protected $fillable = ['fee_quote_id', 'fee_code', 'label', 'units', 'unit_price', 'amount', 'source'];


    protected $casts = [
        'units' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];


    public function quote(): BelongsTo
    {
        return $this->belongsTo(FeeQuote::class, 'fee_quote_id');
    }
}
