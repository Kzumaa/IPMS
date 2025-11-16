<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class File extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'storage', 'bucket', 'object_key', 'url', 'filename', 'mime', 'size_bytes', 'sha256', 'etag', 'uploaded_by', 'uploaded_at', 'page_count', 'figure_count', 'language'
    ];


    protected $casts = ['uploaded_at' => 'datetime'];


    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
