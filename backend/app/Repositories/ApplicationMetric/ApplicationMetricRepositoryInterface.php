<?php

namespace App\Repositories\ApplicaitonMetric;

use App\Models\ApplicationMetric;

interface ApplicationMetricRepositoryInterface
{
    public function saveForApplication(int $applicationId, array $metrics): ApplicationMetric;
}
