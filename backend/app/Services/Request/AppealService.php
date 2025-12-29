<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AppealResolution;
use App\Enums\AppealType;
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

        return DB::transaction(function () use ($application, $userId, $decision, $grounds, $deadline) {
            $request = $this->createRequest($application, $userId);

            RequestAppeal::create([
                'request_id' => $request->id,
                'target_decision_id' => $decision->id,
                'appeal_type' => AppealType::DECISION_APPEAL,
                'grounds' => $grounds,
                'deadline' => $deadline,
            ]);

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
     * Resolve an appeal with a specific resolution.
     */
    public function resolveAppeal(
        ApplicationRequest $request,
        int $staffId,
        AppealResolution $resolution,
        ?string $notes = null
    ): ApplicationRequest {
        return DB::transaction(function () use ($request, $staffId, $resolution, $notes) {
            // Update appeal record
            $request->appeal->update([
                'resolved_at' => now()->toDateString(),
                'resolution' => $resolution,
            ]);

            // Apply resolution effects
            if ($resolution === AppealResolution::OVERTURNED) {
                $this->applyApprovalChanges($request);
            }

            // Update request status based on resolution
            $status = $resolution === AppealResolution::WITHDRAWN
                ? \App\Enums\RequestStatus::REFUSED
                : \App\Enums\RequestStatus::APPROVED;

            return $this->requestRepository->update($request, [
                'status' => $status,
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

        // If the appeal overturns a refusal decision, the application should go back
        // to a state where it can be re-examined or granted.
        // This is a simplified implementation - real logic would depend on business rules.
        if ($appeal->appeal_type === AppealType::DECISION_APPEAL && $appeal->resolution === AppealResolution::OVERTURNED) {
            $request->application->update([
                'status' => \App\Enums\ApplicationStatus::SUB_EXAM,
            ]);
        }
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
