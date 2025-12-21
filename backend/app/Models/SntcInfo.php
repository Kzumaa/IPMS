<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SntcInfo extends Model
{
    public $timestamps = false;
    protected $table = 'sntc_info';
    protected $primaryKey = 'application_id';
    public $incrementing = false;

    protected $fillable = [
        'application_id',
        'agency_name',
        'project_name',
        'project_code',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
