<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationAttachment extends Model
{
    public $timestamps = false;
    protected $fillable = ['application_id', 'file_id', 'doc_type', 'is_current', 'notes', 'created_at'];


    protected $casts = ['is_current' => 'bool', 'created_at' => 'datetime'];


    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class);
    }
}
