<?php

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\FormalityExamRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FormalityExamService
{
    public function processExaminationResult(Application $application, string $result, ?string $notes): FormalityExamRecord
    {
        return DB::transaction(function () use ($application, $result, $notes) {
            // 1. Create Exam Record
            $record = FormalityExamRecord::create([
                'application_id' => $application->id,
                'examiner_id' => Auth::id(), // Assuming Auth::id() returns staff ID when logged in as staff
                'exam_date' => now(),
                'result' => $result,
                'notes' => $notes,
            ]);

            // 2. Update Application Status
            if ($result === 'PASS') {
                $application->update(['status' => ApplicationStatus::PUBLISHED]);
            } else {
                $application->update(['status' => ApplicationStatus::REFUSED]);
            }

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
