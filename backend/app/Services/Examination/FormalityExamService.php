<?php

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\FormalityExamRecord;
use App\Repositories\Examination\FormalityExamRecordRepositoryInterface;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\Assignment\AssignmentRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FormalityExamService
{
    protected $formalityExamRecordRepository;
    protected $applicationRepository;
    protected $assignmentRepository;

    public function __construct(
        FormalityExamRecordRepositoryInterface $formalityExamRecordRepository,
        ApplicationRepositoryInterface $applicationRepository,
        AssignmentRepositoryInterface $assignmentRepository
    ) {
        $this->formalityExamRecordRepository = $formalityExamRecordRepository;
        $this->applicationRepository = $applicationRepository;
        $this->assignmentRepository = $assignmentRepository;
    }
    public function processExaminationResult(Application $application, string $result, ?string $notes): FormalityExamRecord
    {
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
                $this->applicationRepository->update($application, ['status' => ApplicationStatus::PUBLISHED]);
            } else {
                $this->applicationRepository->update($application, ['status' => ApplicationStatus::REFUSED]);
            }

            // 3. Complete Assignment
            $this->assignmentRepository->completeAssignment($application->id, Auth::id());

            return $record;
        });
    }
}
