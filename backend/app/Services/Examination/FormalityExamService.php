<?php

declare(strict_types=1);

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\FormalityExamRecord;
use App\Repositories\Examination\FormalityExamRecordRepositoryInterface;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\Assignment\AssignmentRepositoryInterface;
use App\Services\Application\ApplicationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FormalityExamService
{
    protected FormalityExamRecordRepositoryInterface $formalityExamRecordRepository;
    protected ApplicationRepositoryInterface $applicationRepository;
    protected AssignmentRepositoryInterface $assignmentRepository;
    protected ApplicationService $applicationService;

    public function __construct(
        FormalityExamRecordRepositoryInterface $formalityExamRecordRepository,
        ApplicationRepositoryInterface $applicationRepository,
        AssignmentRepositoryInterface $assignmentRepository,
        ApplicationService $applicationService
    ) {
        $this->formalityExamRecordRepository = $formalityExamRecordRepository;
        $this->applicationRepository = $applicationRepository;
        $this->assignmentRepository = $assignmentRepository;
        $this->applicationService = $applicationService;
    }
    public function processExaminationResult(Application $application, string $result, ?string $notes): FormalityExamRecord
    {
        // Block examination if application is under post-grant amendment review
        if ($application->status === ApplicationStatus::UNDER_AMENDMENT) {
            throw ValidationException::withMessages([
                'status' => 'Cannot perform examination while post-grant amendment is under review.',
            ]);
        }

        return DB::transaction(function () use ($application, $result, $notes) {
            // 1. Create Exam Record
            $record = $this->formalityExamRecordRepository->create([
                'application_id' => $application->id,
                'examiner_id' => Auth::id(), // Assuming Auth::id() returns staff ID when logged in as staff
                'exam_date' => now(),
                'result' => $result,
                'notes' => $notes,
            ]);

            // 2. Update Application Status
            if ($result === 'PASS') {
                // Generate application number on formal acceptance
                $appNo = $this->generateApplicationNumber($application);

                // Transition to FORMALITY_PASSED - publication happens later when conditions are met
                $this->applicationRepository->update($application, [
                    'status' => ApplicationStatus::FORMALITY_PASSED,
                    'app_no' => $appNo,
                ]);

                // 3. Recalculate deadlines for Industrial Design applications
                // (sets publication and substantive exam deadlines based on acceptance date)
                $this->applicationService->recalculateDeadlinesOnAcceptance($application);
            } else {
                $this->applicationRepository->update($application, ['status' => ApplicationStatus::DECLINED]);
            }

            // 4. Complete Assignment
            $this->assignmentRepository->completeAssignment($application->id, Auth::id());

            return $record;
        });
    }

    /**
     * Generate a unique application number.
     * Format: {type_prefix}-{year}-{sequence}
     * Example: 1-2024-00001 (Patent), 2-2024-00001 (Utility), 3-2024-00001 (Design)
     */
    protected function generateApplicationNumber(Application $application): string
    {
        $typePrefix = match ($application->app_type) {
            \App\Enums\AppType::PATENT => '1',
            \App\Enums\AppType::UTILITY => '2',
            \App\Enums\AppType::INDUSTRIAL_DESIGN => '3',
            default => '0',
        };

        $year = now()->format('Y');

        // Get the next sequence number for this type and year
        $lastApp = Application::where('app_no', 'LIKE', "{$typePrefix}-{$year}-%")
            ->orderByRaw("CAST(SUBSTRING(app_no FROM '\d+$') AS INTEGER) DESC")
            ->first();

        if ($lastApp && preg_match('/(\d+)$/', $lastApp->app_no, $matches)) {
            $sequence = (int) $matches[1] + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('%s-%s-%05d', $typePrefix, $year, $sequence);
    }
}
