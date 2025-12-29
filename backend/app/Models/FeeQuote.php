<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeQuote extends Model
{
    public $timestamps = false;
    protected $fillable = ['application_id', 'request_id', 'version', 'currency', 'total_amount', 'status', 'generated_at', 'law_version'];


    protected $casts = ['generated_at' => 'datetime'];


    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(FeeQuoteLine::class);
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }
}
