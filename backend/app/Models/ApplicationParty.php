<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationParty extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'application_id', 'role', 'user_id', 'snapshot_name', 'snapshot_address', 'snapshot_email', 'nationality', 'is_primary'
    ];


    protected $casts = ['is_primary' => 'bool'];


    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
