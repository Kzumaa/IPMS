<?php

namespace App\Repositories\Assignment;

use App\Models\ApplicationAssignment;

class AssignmentRepository implements AssignmentRepositoryInterface
{
    public function completeAssignment(int $applicationId, int $staffId): void
    {
        ApplicationAssignment::where('application_id', $applicationId)
            ->where('status', 'ACTIVE')
            ->where('staff_id', $staffId)
            ->update([
                'status' => 'COMPLETED',
                'completed_at' => now(),
            ]);
    }
}
