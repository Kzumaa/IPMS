<?php

namespace App\Repositories\File;

use App\Models\File;

interface FileRepositoryInterface
{
    public function update(File $file, array $data): bool;
}
