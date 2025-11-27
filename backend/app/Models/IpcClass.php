<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpcClass extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'ipc_classes';
    protected $fillable = ['application_id', 'ipc_code', 'version', 'sort_order'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
