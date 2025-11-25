<?php

namespace App\Services\File;

use App\Models\File;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    public function storeFile(UploadedFile $uploadedFile, User $uploader): File
    {
        $hash = hash_file('sha256', $uploadedFile->path());
        
        // Check if file already exists by hash to avoid duplicates (optional optimization)
        // For now, we'll always upload new files but could implement deduplication later.

        $uuid = Str::uuid();
        $extension = $uploadedFile->getClientOriginalExtension();
        $year = date('Y');
        $month = date('m');
        
        // Structure: files/YYYY/MM/UUID.ext
        $objectKey = "files/{$year}/{$month}/{$uuid}.{$extension}";
        
        // Upload to S3/R2
        $disk = config('filesystems.default', 's3');
        Storage::disk($disk)->putFileAs(dirname($objectKey), $uploadedFile, basename($objectKey));

        // Create DB record
        return File::create([
            'storage' => $disk === 's3' ? 'S3' : 'R2', // Assuming 's3' driver maps to S3 or R2 enum
            'bucket' => config('filesystems.disks.s3.bucket'),
            'object_key' => $objectKey,
            'filename' => $uploadedFile->getClientOriginalName(),
            'mime' => $uploadedFile->getMimeType(),
            'size_bytes' => $uploadedFile->getSize(),
            'sha256' => $hash,
            'uploaded_by' => $uploader->id,
            'uploaded_at' => now(),
        ]);
    }
}
