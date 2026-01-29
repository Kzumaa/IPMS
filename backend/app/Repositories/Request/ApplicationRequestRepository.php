<?php

declare(strict_types=1);

namespace App\Repositories\Request;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use Illuminate\Database\Eloquent\Collection;

class ApplicationRequestRepository implements ApplicationRequestRepositoryInterface
{
    public function create(array $data): ApplicationRequest
    {
        return ApplicationRequest::create($data);
    }

    public function update(ApplicationRequest $request, array $data): ApplicationRequest
    {
        $request->update($data);
        return $request->fresh();
    }

    public function find(int $id): ?ApplicationRequest
    {
        return ApplicationRequest::find($id);
    }

    public function findWithDetails(int $id): ?ApplicationRequest
    {
        return ApplicationRequest::with([
            'amendment',
            'assignment',
            'assignment.assignor',
            'assignment.assignee',
            'license',
            'license.licensor',
            'license.licensees.licensee',
            'complaint',
            'attachments',
            'attachments.file',
            'feeQuote',
            'feeQuote.lines',
            'creator',
        ])->find($id);
    }

    public function findByApplicationId(int $applicationId): Collection
    {
        return ApplicationRequest::where('application_id', $applicationId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function findByApplicationIdAndType(int $applicationId, RequestType $type): Collection
    {
        return ApplicationRequest::where('application_id', $applicationId)
            ->where('type', $type)
            ->orderByDesc('created_at')
            ->get();
    }

    public function hasPendingOfType(Application $application, RequestType $type): bool
    {
        return ApplicationRequest::where('application_id', $application->id)
            ->where('type', $type)
            ->whereIn('status', [
                RequestStatus::DRAFT,
                RequestStatus::SUBMITTED,
                RequestStatus::EXAMINING,
            ])
            ->exists();
    }

    public function findPendingByType(Application $application, RequestType $type): ?ApplicationRequest
    {
        return ApplicationRequest::where('application_id', $application->id)
            ->where('type', $type)
            ->whereIn('status', [
                RequestStatus::DRAFT,
                RequestStatus::SUBMITTED,
                RequestStatus::EXAMINING,
            ])
            ->first();
    }

    public function getLatestVersion(int $applicationId): int
    {
        return ApplicationRequest::where('application_id', $applicationId)
            ->count();
    }
}
