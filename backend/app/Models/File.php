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


    protected $appends = ['download_url'];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getDownloadUrlAttribute()
    {
        if ($this->url) {
            return $this->url;
        }

        $disk = strtolower($this->storage);

        // For S3/R2, use temporary URL to ensure access to private buckets
        if (in_array($disk, ['s3', 'r2'])) {
            try {
                return \Illuminate\Support\Facades\Storage::disk($disk)->temporaryUrl(
                    $this->object_key,
                    now()->addMinutes(20),
                    [
                        'ResponseContentDisposition' => 'attachment; filename="' . $this->filename . '"',
                    ]
                );
            } catch (\Exception $e) {
                // Fallback or log if needed, though temporaryUrl is generally supported by S3 adapter
                return null;
            }
        }

        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->object_key);
    }
}
