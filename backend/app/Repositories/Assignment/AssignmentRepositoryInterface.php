<?php

namespace App\Repositories\Assignment;

interface AssignmentRepositoryInterface
{
    public function completeAssignment(int $applicationId, int $staffId): void;
}
