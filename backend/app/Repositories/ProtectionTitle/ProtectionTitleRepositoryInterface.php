<?php

namespace App\Repositories\ProtectionTitle;

use App\Models\ProtectionTitle;

interface ProtectionTitleRepositoryInterface
{
    public function create(array $data): ProtectionTitle;
}
