<?php

namespace App\Repositories\Application;

use App\Models\Application;

class ApplicationRepository implements ApplicationRepositoryInterface
{
    public function create(array $data): Application
    {
        return Application::create($data);
    }

    public function update(Application $application, array $data): Application
    {
        $application->update($data);
        return $application;
    }

    public function delete(Application $application): bool
    {
        return $application->delete();
    }

    public function find(int $id): ?Application
    {
        return Application::find($id);
    }

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

    public function syncPriorityClaims(Application $application, array $claims): void
    {
        $application->priorityClaims()->delete();
        $application->priorityClaims()->createMany($claims);
    }

    public function syncIpcClasses(Application $application, array $classes): void
    {
        $application->ipcClasses()->delete();
        $application->ipcClasses()->createMany($classes);
    }

    public function syncLocarnoClasses(Application $application, array $classes): void
    {
        $application->locarnoClasses()->delete();
        $application->locarnoClasses()->createMany($classes);
    }
}
