<?php

namespace App\Repositories\File;

use App\Models\File;

class FileRepository implements FileRepositoryInterface
{
    public function update(File $file, array $data): bool
    {
        return $file->update($data);
    }
}
