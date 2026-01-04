<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AppealResolution;
use App\Enums\AppealType;
use App\Enums\ApplicationStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\DecisionRecord;
use App\Models\RequestAppeal;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppealService extends BaseRequestService
{
    private const APPEAL_DEADLINE_DAYS = 90;
    private const MAX_APPEALS = 3;

    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::APPEAL;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-APPEAL';
    }

    /**
     * Override validation to add max appeals check.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Check max appeals for the latest decision
        $latestDecision = $application->decisionRecords()
            ->where('decision_type', 'REFUSE')
            ->latest('decision_date')
            ->first();

        if ($latestDecision) {
            $appealCount = $this->countAppealsForDecision($application, $latestDecision->id);
            if ($appealCount >= self::MAX_APPEALS) {
                throw ValidationException::withMessages([
                    'appeal' => 'Maximum number of appeals (' . self::MAX_APPEALS . ') has been reached for this decision.',
                ]);
            }
        }
    }

    /**
     * Count the number of appeals for a specific decision.
     */
    public function countAppealsForDecision(Application $application, int $decisionId): int
    {
        return $application->requests()
            ->where('type', RequestType::APPEAL)
            ->whereHas('appeal', function ($query) use ($decisionId) {
                $query->where('target_decision_id', $decisionId);
            })
            ->count();
    }

    /**
     * Get the next appeal number for a decision.
     */
    private function getNextAppealNumber(Application $application, int $decisionId): int
    {
        $count = $this->countAppealsForDecision($application, $decisionId);
        return $count + 1;
    }

    /**
     * Get remaining appeal count for an application.
     */
    public function getRemainingAppeals(Application $application): int
    {
        $latestDecision = $application->decisionRecords()
            ->where('decision_type', 'REFUSE')
            ->latest('decision_date')
            ->first();

        if (!$latestDecision) {
            return self::MAX_APPEALS;
        }

        $appealCount = $this->countAppealsForDecision($application, $latestDecision->id);
        return max(0, self::MAX_APPEALS - $appealCount);
    }

    /**
     * Create a new appeal request for a decision.
     */
    public function createAppealForDecision(
        Application $application,
        int $userId,
        DecisionRecord $decision,
        string $grounds
    ): ApplicationRequest {
        // Validate decision can be appealed
        if ($decision->decision_type !== 'REFUSE') {
            throw ValidationException::withMessages([
                'decision' => 'Only refusal decisions can be appealed.',
            ]);
        }

        // Calculate and validate deadline
        $deadline = Carbon::parse($decision->decision_date)->addDays(self::APPEAL_DEADLINE_DAYS);
        if (now()->gt($deadline)) {
            throw ValidationException::withMessages([
                'deadline' => 'Appeal deadline has passed. Appeals must be filed within 90 days of the decision.',
            ]);
        }

        // Get next appeal number
        $appealNumber = $this->getNextAppealNumber($application, $decision->id);

        return DB::transaction(function () use ($application, $userId, $decision, $grounds, $deadline, $appealNumber) {
            $request = $this->createRequest($application, $userId);

            RequestAppeal::create([
                'request_id' => $request->id,
                'target_decision_id' => $decision->id,
                'appeal_type' => AppealType::DECISION_APPEAL,
                'grounds' => $grounds,
                'deadline' => $deadline,
                'appeal_number' => $appealNumber,
            ]);

            // Update application status to APPEAL_PENDING
            $application->update(['status' => ApplicationStatus::APPEAL_PENDING]);

            $this->generateFeeQuote($request);

            return $request->load(['appeal', 'appeal.targetDecision', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Create a new appeal/objection request for an official notice.
     */
    public function createAppealForNotice(
        Application $application,
        int $userId,
        int $eventId,
        string $grounds,
        Carbon $noticeDate
    ): ApplicationRequest {
        $deadline = $noticeDate->copy()->addDays(self::APPEAL_DEADLINE_DAYS);

        if (now()->gt($deadline)) {
            throw ValidationException::withMessages([
                'deadline' => 'Objection deadline has passed. Objections must be filed within 90 days of the notice.',
            ]);
        }

        return DB::transaction(function () use ($application, $userId, $eventId, $grounds, $deadline) {
            $request = $this->createRequest($application, $userId);

            RequestAppeal::create([
                'request_id' => $request->id,
                'target_event_id' => $eventId,
                'appeal_type' => AppealType::NOTICE_OBJECTION,
                'grounds' => $grounds,
                'deadline' => $deadline,
            ]);

            $this->generateFeeQuote($request);

            return $request->load(['appeal', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Start examination of an appeal (staff action).
     */
    public function startExamination(ApplicationRequest $request, int $staffId): ApplicationRequest
    {
        return DB::transaction(function () use ($request, $staffId) {
            // Update application status to APPEAL_EXAMINING
            $request->application->update(['status' => ApplicationStatus::APPEAL_EXAMINING]);

            return $this->requestRepository->update($request, [
                'status' => \App\Enums\RequestStatus::EXAMINING,
                'processed_by' => $staffId,
            ]);
        });
    }

    /**
     * Resolve an appeal with a specific resolution.
     */
    public function resolveAppeal(
        ApplicationRequest $request,
        int $staffId,
        AppealResolution $resolution,
        ?string $notes = null
    ): ApplicationRequest {
        return DB::transaction(function () use ($request, $staffId, $resolution, $notes) {
            $application = $request->application;

            // Update appeal record
            $request->appeal->update([
                'resolved_at' => now()->toDateString(),
                'resolution' => $resolution,
            ]);

            // Update application status based on resolution
            $newAppStatus = match ($resolution) {
                AppealResolution::OVERTURNED => ApplicationStatus::SUB_EXAM, // Re-examine
                AppealResolution::PARTIAL => ApplicationStatus::SUB_EXAM, // Re-examine with modifications
                AppealResolution::UPHELD => ApplicationStatus::REFUSED, // Decision stands
                AppealResolution::WITHDRAWN => ApplicationStatus::REFUSED, // Decision stands
            };
            $application->update(['status' => $newAppStatus]);

            // Apply approval changes if overturned
            if ($resolution === AppealResolution::OVERTURNED || $resolution === AppealResolution::PARTIAL) {
                $this->applyApprovalChanges($request);
            }

            // Update request status
            $requestStatus = $resolution === AppealResolution::WITHDRAWN
                ? \App\Enums\RequestStatus::REFUSED
                : \App\Enums\RequestStatus::APPROVED;

            return $this->requestRepository->update($request, [
                'status' => $requestStatus,
                'processed_date' => now()->toDateString(),
                'processed_by' => $staffId,
                'processing_notes' => $notes,
            ]);
        });
    }

    /**
     * Apply changes when appeal is upheld (original decision overturned).
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $appeal = $request->appeal;

        if (!$appeal) {
            return;
        }

        // The application has already been set to SUB_EXAM in resolveAppeal.
        // Additional business logic can be added here if needed.
    }

    /**
     * Delete a draft appeal request.
     */
    public function deleteAppeal(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft appeal requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->appeal()->delete();

            return $request->delete();
        });
    }
}
