<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\RequestTermination;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TerminationService extends BaseRequestService
{
    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::TERMINATION;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-TERMINATE';
    }

    /**
     * Override validation to check application status.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Application must be GRANTED to terminate
        if ($application->status !== ApplicationStatus::GRANTED) {
            throw ValidationException::withMessages([
                'application' => 'Only granted applications can be terminated.',
            ]);
        }
    }

    /**
     * Create a new termination request.
     */
    public function createTermination(
        Application $application,
        int $userId,
        ?string $reason = null,
        ?Carbon $effectiveDate = null
    ): ApplicationRequest {
        $effectiveDate = $effectiveDate ?? Carbon::now();

        return DB::transaction(function () use ($application, $userId, $reason, $effectiveDate) {
            $request = $this->createRequest($application, $userId);

            RequestTermination::create([
                'request_id' => $request->id,
                'reason' => $reason,
                'effective_date' => $effectiveDate->toDateString(),
            ]);

            $this->generateFeeQuote($request);

            return $request->load(['termination', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when termination is approved.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $application = $request->application;
        $protectionTitle = $application->protectionTitle;

        // Update application status to TERMINATED
        $application->update(['status' => ApplicationStatus::TERMINATED]);

        // Update protection title status if it exists
        if ($protectionTitle) {
            $protectionTitle->update(['status' => 'TERMINATED']);
        }
    }

    /**
     * Delete a draft termination request.
     */
    public function deleteTermination(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft termination requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->termination()->delete();

            return $request->delete();
        });
    }
}
