<?php

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\SubstantiveExamRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubstantiveExamService
{
    public function processExaminationResult(Application $application, string $result, ?string $notes): SubstantiveExamRecord
    {
        return DB::transaction(function () use ($application, $result, $notes) {
            // 1. Create Exam Record
            $record = SubstantiveExamRecord::create([
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

            $application->update(['status' => $status]);

            // 3. Complete Assignment
            $application->assignments()
                ->where('status', 'ACTIVE')
                ->where('staff_id', Auth::id())
                ->update([
                    'status' => 'COMPLETED',
                    'completed_at' => now(),
                ]);

            return $record;
        });
    }
}
