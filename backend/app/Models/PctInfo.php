<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PctInfo extends Model
{
    public $timestamps = false;
    protected $table = 'pct_info';
    protected $primaryKey = 'application_id';
    public $incrementing = false;

    protected $fillable = [
        'application_id',
        'pct_app_no',
        'pct_filing_date',
        'pct_pub_no',
        'pct_pub_date',
        'amended_on_national_phase',
    ];

    protected $casts = [
        'pct_filing_date' => 'date',
        'pct_pub_date' => 'date',
        'amended_on_national_phase' => 'boolean',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
