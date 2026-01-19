<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\ComplaintResolution;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\DecisionRecord;
use App\Models\RequestComplaint;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ComplaintService extends BaseRequestService
{
    private const COMPLAINT_DEADLINE_DAYS = 90;
    private const MAX_COMPLAINTS = 3;

    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::COMPLAINT;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-COMPLAINT';
    }

    /**
     * Override validation to add max complaints check.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Application must be DECLINED to file a complaint
        if ($application->status !== ApplicationStatus::DECLINED) {
            throw ValidationException::withMessages([
                'application' => 'Complaints can only be filed for declined applications.',
            ]);
        }

        // Check max complaints for this application
        $complaintCount = $this->countComplaintsForApplication($application);
        if ($complaintCount >= self::MAX_COMPLAINTS) {
            throw ValidationException::withMessages([
                'complaint' => 'Maximum number of complaints (' . self::MAX_COMPLAINTS . ') has been reached for this application.',
            ]);
        }
    }

    /**
     * Count the number of complaints for an application.
     */
    public function countComplaintsForApplication(Application $application): int
    {
        return $application->requests()
            ->where('type', RequestType::COMPLAINT)
            ->count();
    }

    /**
     * Get the next complaint number for an application.
     */
    private function getNextComplaintNumber(Application $application): int
    {
        $count = $this->countComplaintsForApplication($application);
        return $count + 1;
    }

    /**
     * Get remaining complaint count for an application.
     */
    public function getRemainingComplaints(Application $application): int
    {
        $complaintCount = $this->countComplaintsForApplication($application);
        return max(0, self::MAX_COMPLAINTS - $complaintCount);
    }

    /**
     * Create a new complaint request.
     */
    public function createComplaint(
        Application $application,
        int $userId,
        string $grounds
    ): ApplicationRequest {
        // Get the latest decline decision to determine deadline
        $latestDecision = $application->decisionRecords()
            ->where('type', 'REFUSE')
            ->latest('decision_date')
            ->first();

        // Calculate deadline (90 days from decision or now if no decision record)
        $decisionDate = $latestDecision?->decision_date ?? now();
        $deadline = Carbon::parse($decisionDate)->addDays(self::COMPLAINT_DEADLINE_DAYS);

        // Validate deadline
        if (now()->gt($deadline)) {
            throw ValidationException::withMessages([
                'deadline' => 'Complaint deadline has passed. Complaints must be filed within 90 days of the decision.',
            ]);
        }

        // Get next complaint number
        $complaintNumber = $this->getNextComplaintNumber($application);

        return DB::transaction(function () use ($application, $userId, $grounds, $deadline, $complaintNumber) {
            $request = $this->createRequest($application, $userId);

            RequestComplaint::create([
                'request_id' => $request->id,
                'grounds' => $grounds,
                'deadline' => $deadline,
                'complaint_number' => $complaintNumber,
            ]);

            // Update application status to COMPLAINING
            $application->update(['status' => ApplicationStatus::COMPLAINING]);

            $this->generateFeeQuote($request);

            return $request->load(['complaint', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Start examination of a complaint (staff action).
     */
    public function startExamination(ApplicationRequest $request, int $staffId): ApplicationRequest
    {
        return DB::transaction(function () use ($request, $staffId) {
            // Update application status to CHECKING_COMPLAINT
            $request->application->update(['status' => ApplicationStatus::CHECKING_COMPLAINT]);

            return $this->requestRepository->update($request, [
                'status' => \App\Enums\RequestStatus::EXAMINING,
                'processed_by' => $staffId,
            ]);
        });
    }

    /**
     * Resolve a complaint with a specific resolution.
     */
    public function resolveComplaint(
        ApplicationRequest $request,
        int $staffId,
        ComplaintResolution $resolution,
        ?string $notes = null
    ): ApplicationRequest {
        return DB::transaction(function () use ($request, $staffId, $resolution, $notes) {
            $application = $request->application;

            // Update complaint record
            $request->complaint->update([
                'resolved_at' => now()->toDateString(),
                'resolution' => $resolution,
            ]);

            // Update application status based on resolution
            $newAppStatus = match ($resolution) {
                ComplaintResolution::ACCEPTED => $this->getPreviousExamStage($application),
                ComplaintResolution::REJECTED => ApplicationStatus::DECLINED,
            };
            $application->update(['status' => $newAppStatus]);

            // Update request status
            $requestStatus = $resolution === ComplaintResolution::ACCEPTED
                ? \App\Enums\RequestStatus::APPROVED
                : \App\Enums\RequestStatus::REFUSED;

            return $this->requestRepository->update($request, [
                'status' => $requestStatus,
                'processed_date' => now()->toDateString(),
                'processed_by' => $staffId,
                'processing_notes' => $notes,
            ]);
        });
    }

    /**
     * Get the previous examination stage to revert to.
     * Based on where the application was declined from.
     */
    private function getPreviousExamStage(Application $application): ApplicationStatus
    {
        // Check the latest exam records to determine which stage declined the application
        $latestFormalityExam = $application->formalityExamRecords()
            ->where('result', 'FAIL')
            ->latest('exam_date')
            ->first();

        $latestSubstantiveExam = $application->substantiveExamRecords()
            ->where('result', 'REJECTED')
            ->latest('exam_date')
            ->first();

        // If substantive exam rejected more recently, revert to PUBLISHED
        if ($latestSubstantiveExam && (!$latestFormalityExam ||
            $latestSubstantiveExam->exam_date > $latestFormalityExam->exam_date)) {
            return ApplicationStatus::PUBLISHED;
        }

        // Otherwise revert to FORMALITY_EXAM
        return ApplicationStatus::FORMALITY_PASSED;
    }
}
