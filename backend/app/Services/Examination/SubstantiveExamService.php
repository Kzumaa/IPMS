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
                'REJECTED' => ApplicationStatus::REFUSED,
                'OBJECTION' => ApplicationStatus::WAITING_RESPONSE,
                default => $application->status,
            };

            $this->applicationRepository->update($application, ['status' => $status]);

            // 3. Complete Assignment
            $this->assignmentRepository->completeAssignment($application->id, Auth::id());

            return $record;
        });
    }
}
