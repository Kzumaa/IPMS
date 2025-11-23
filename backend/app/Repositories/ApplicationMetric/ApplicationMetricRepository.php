<?php

namespace App\Repositories\ApplicationMetric;


use App\Models\ApplicationMetric;

class ApplicationMetricRepository implements ApplicationMetricRepositoryInterface
{
    public function saveForApplication(int $applicationId, array $metrics): ApplicationMetric
    {
        $metrics['application_id'] = $applicationId;

        return ApplicationMetric::updateOrCreate(
            ['application_id' => $applicationId],
            $metrics
        );
    }
}
