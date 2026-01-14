<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\RequestWithdrawal;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WithdrawalService extends BaseRequestService
{
    /**
     * Statuses that allow withdrawal (pre-grant statuses).
     */
    private const WITHDRAWABLE_STATUSES = [
        ApplicationStatus::DRAFT,
        ApplicationStatus::SUBMITTED,
        ApplicationStatus::FORMALITY_EXAM,
        ApplicationStatus::FORMALITY_PASSED,
        ApplicationStatus::PUBLISHED,
        ApplicationStatus::SUB_EXAM_REQ,
        ApplicationStatus::SUB_EXAM,
        ApplicationStatus::WAITING_RESPONSE,
    ];

    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::WITHDRAWAL;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-WITHDRAW';
    }

    /**
     * Override validation to check application status.
     *
     * Withdrawal is only allowed for pre-grant applications.
     * For post-grant (GRANTED), use Termination instead.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Cannot withdraw GRANTED applications (use Termination instead)
        if ($application->status === ApplicationStatus::GRANTED) {
            throw ValidationException::withMessages([
                'application' => 'Granted applications cannot be withdrawn. Use termination request instead.',
            ]);
        }

        // Cannot withdraw DECLINED, WITHDRAWN, or TERMINATED applications
        if (in_array($application->status, [
            ApplicationStatus::DECLINED,
            ApplicationStatus::WITHDRAWN,
            ApplicationStatus::TERMINATED,
        ])) {
            throw ValidationException::withMessages([
                'application' => 'This application cannot be withdrawn.',
            ]);
        }

        // Check if there's already a pending withdrawal request
        $pendingWithdrawal = $application->requests()
            ->where('type', RequestType::WITHDRAWAL)
            ->whereIn('status', [RequestStatus::DRAFT, RequestStatus::SUBMITTED, RequestStatus::EXAMINING])
            ->exists();

        if ($pendingWithdrawal) {
            throw ValidationException::withMessages([
                'application' => 'There is already a pending withdrawal request for this application.',
            ]);
        }
    }

    /**
     * Create a new withdrawal request.
     */
    public function createWithdrawal(
        Application $application,
        int $userId,
        ?string $reason = null,
        ?Carbon $effectiveDate = null
    ): ApplicationRequest {
        $this->validateCanCreateRequest($application);

        $effectiveDate = $effectiveDate ?? Carbon::now();

        return DB::transaction(function () use ($application, $userId, $reason, $effectiveDate) {
            $request = $this->createRequest($application, $userId);

            RequestWithdrawal::create([
                'request_id' => $request->id,
                'reason' => $reason,
                'effective_date' => $effectiveDate->toDateString(),
            ]);

            // Withdrawal typically has no fee, but generate quote anyway for consistency
            $this->generateFeeQuote($request);

            return $request->load(['withdrawal', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when withdrawal is approved.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $application = $request->application;

        // Update application status to WITHDRAWN
        $application->update(['status' => ApplicationStatus::WITHDRAWN]);
    }

    /**
     * Delete a draft withdrawal request.
     */
    public function deleteWithdrawal(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft withdrawal requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->withdrawal()->delete();

            return $request->delete();
        });
    }

    /**
     * Check if an application can be withdrawn.
     */
    public function canWithdraw(Application $application): bool
    {
        // Check status
        if (!in_array($application->status, self::WITHDRAWABLE_STATUSES)) {
            return false;
        }

        // Check for pending withdrawal
        $hasPendingWithdrawal = $application->requests()
            ->where('type', RequestType::WITHDRAWAL)
            ->whereIn('status', [RequestStatus::DRAFT, RequestStatus::SUBMITTED, RequestStatus::EXAMINING])
            ->exists();

        return !$hasPendingWithdrawal;
    }
}
