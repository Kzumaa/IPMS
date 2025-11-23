<?php

namespace App\Repositories\Application;

use App\Models\Application;

interface ApplicationRepositoryInterface
{
    public function createDraft(int $userId, array $data): Application;

    public function findByIdForUser(int $id, int $userId): ?Application;
}
