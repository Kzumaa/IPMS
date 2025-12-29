<?php

declare(strict_types=1);

namespace App\Repositories\Request;

use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use Illuminate\Database\Eloquent\Collection;

interface ApplicationRequestRepositoryInterface
{
    public function create(array $data): ApplicationRequest;

    public function update(ApplicationRequest $request, array $data): ApplicationRequest;

    public function find(int $id): ?ApplicationRequest;

    public function findWithDetails(int $id): ?ApplicationRequest;

    public function findByApplicationId(int $applicationId): Collection;

    public function findByApplicationIdAndType(int $applicationId, RequestType $type): Collection;

    public function hasPendingOfType(Application $application, RequestType $type): bool;

    public function findPendingByType(Application $application, RequestType $type): ?ApplicationRequest;

    public function getLatestVersion(int $applicationId): int;
}
