<?php

namespace App\Services\Assignment;

use App\Models\Application;
use App\Models\ApplicationAssignment;
use App\Models\AuthorityStaff;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    public function assignToFormalityExaminer(Application $application): void
    {
        // Simple random assignment for now
        $examiner = AuthorityStaff::where('role', 'FORMALITY_OFFICER')
            ->where('is_active', true)
            ->inRandomOrder()
            ->first();

        if (!$examiner) {
            // Fallback or log error if no examiner available
            // For now, we might leave it unassigned or assign to a default admin
            return;
        }

        DB::transaction(function () use ($application, $examiner) {
            ApplicationAssignment::create([
                'application_id' => $application->id,
                'staff_id' => $examiner->id,
                'stage' => 'FORMALITY_EXAM',
                'status' => 'ACTIVE',
                'assigned_by_id' => $examiner->id, // System assignment, using examiner id for now or create a system user
                'assigned_at' => now(),
            ]);

            $application->update(['current_assignee_id' => $examiner->id]);
        });
    }
}
