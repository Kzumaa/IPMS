<?php

namespace App\Repositories\ApplicationMetric;

use App\Models\ApplicationMetric;

interface ApplicationMetricRepositoryInterface
{
    public function saveForApplication(int $applicationId, array $metrics): ApplicationMetric;
}
