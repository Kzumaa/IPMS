<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocarnoClass extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'locarno_classes';
    protected $fillable = [
        'application_id',
        'class_no',
        'subclass_no',
        'version',
        'field_of_use',
        'sort_order',
        'assigned_by_type',
        'assigned_by_id',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Check if this classification was assigned by staff.
     */
    public function isStaffAssigned(): bool
    {
        return $this->assigned_by_type === 'STAFF';
    }
}
