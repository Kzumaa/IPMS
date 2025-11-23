<?php

namespace App\Repositories\Application;

use App\Models\Application;

class ApplicationRepository implements ApplicationRepositoryInterface
{
    public function createDraft(int $userId, array $data): Application
    {
        $payload = array_merge($data, [
            'user_id' => $userId,
            'status' => 'DRAFT',
        ]);

        return Application::create($payload);
    }

    public function findByIdForUser(int $id, int $userId): ?Application
    {
        return Application::where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }
}
