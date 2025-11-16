<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationMetric extends Model
{
    public $timestamps = false;
    protected $table = 'application_metrics';
    protected $primaryKey = 'application_id';
    public $incrementing = false;

    protected $fillable = [
        'application_id',
        'description_pages',
        'claims_independent',
        'claims_total',
        'drawings_images',
        'ipc_groups',
        'id_variants',
        'id_images_per_variant',
        'has_priority',
        'priority_count',
    ];

    protected $casts = [
        'application_id' => 'integer',
        'description_pages' => 'integer',
        'claims_independent' => 'integer',
        'claims_total' => 'integer',
        'drawings_images' => 'integer',
        'ipc_groups' => 'integer',
        'id_variants' => 'integer',
        'id_images_per_variant' => 'integer',
        'has_priority' => 'boolean',
        'priority_count' => 'integer',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
