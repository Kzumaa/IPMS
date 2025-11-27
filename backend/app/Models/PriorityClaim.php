<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriorityClaim extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'priority_claims';
    protected $fillable = ['application_id', 'kind', 'number', 'filing_date', 'country_code', 'agreement_name'];

    protected $casts = [
        'filing_date' => 'date',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
