<?php

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\SubstantiveExamRecord;
use App\Repositories\Examination\SubstantiveExamRecordRepositoryInterface;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\Assignment\AssignmentRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubstantiveExamService
{
    protected $substantiveExamRecordRepository;
    protected $applicationRepository;
    protected $assignmentRepository;

    public function __construct(
        SubstantiveExamRecordRepositoryInterface $substantiveExamRecordRepository,
        ApplicationRepositoryInterface $applicationRepository,
        AssignmentRepositoryInterface $assignmentRepository
    ) {
        $this->substantiveExamRecordRepository = $substantiveExamRecordRepository;
        $this->applicationRepository = $applicationRepository;
        $this->assignmentRepository = $assignmentRepository;
    }
    public function processExaminationResult(Application $application, string $result, ?string $notes): SubstantiveExamRecord
    {
        // Block examination if application is under post-grant amendment review
        if ($application->status === ApplicationStatus::UNDER_AMENDMENT) {
            throw ValidationException::withMessages([
                'status' => 'Cannot perform examination while post-grant amendment is under review.',
            ]);
        }

        return DB::transaction(function () use ($application, $result, $notes) {
            // 1. Create Exam Record
            $record = $this->substantiveExamRecordRepository->create([
                'application_id' => $application->id,
                'examiner_id' => Auth::id(),
                'exam_date' => now(),
                'result' => $result,
                'notes' => $notes,
            ]);

            // 2. Update Application Status
            $status = match ($result) {
                'ACCEPTABLE' => ApplicationStatus::GRANTED,
                'REJECTED' => ApplicationStatus::DECLINED,
                'OBJECTION' => ApplicationStatus::WAITING_RESPONSE,
                default => $application->status,
            };

            $updateData = ['status' => $status];

            // Calculate Expiry Date if GRANTED
            if ($status === ApplicationStatus::GRANTED && $application->filing_date) {
                $years = match ($application->app_type) {
                    \App\Enums\AppType::PATENT => 20,
                    \App\Enums\AppType::UTILITY => 10,
                    \App\Enums\AppType::INDUSTRIAL_DESIGN => 5,
                    default => 0,
                };

                if ($years > 0) {
                    $updateData['expiry_date'] = $application->filing_date->copy()->addYears($years)->toDateString();
                }
            }

            $this->applicationRepository->update($application, $updateData);

            // 3. Complete Assignment
            $this->assignmentRepository->completeAssignment($application->id, Auth::id());

            return $record;
        });
    }
}
