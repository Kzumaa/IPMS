<?php

namespace App\Repositories\ProtectionTitle;

use App\Models\ProtectionTitle;

class ProtectionTitleRepository implements ProtectionTitleRepositoryInterface
{
    public function create(array $data): ProtectionTitle
    {
        return ProtectionTitle::create($data);
    }
}
