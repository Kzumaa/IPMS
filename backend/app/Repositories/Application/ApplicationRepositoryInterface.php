<?php

namespace App\Repositories\Application;

use App\Models\Application;

interface ApplicationRepositoryInterface
{
    public function create(array $data): Application;
    public function update(Application $application, array $data): Application;
    public function delete(Application $application): bool;
    public function find(int $id): ?Application;
    public function createDraft(int $userId, array $data): Application;
    public function findByIdForUser(int $id, int $userId): ?Application;
    public function syncPriorityClaims(Application $application, array $claims): void;
    public function syncIpcClasses(Application $application, array $classes): void;
    public function syncLocarnoClasses(Application $application, array $classes): void;
}
