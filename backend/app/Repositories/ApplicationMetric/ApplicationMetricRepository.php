<?php

namespace App\Repositories\ApplicationMetric;

use App\Models\ApplicationMetric;

class ApplicationMetricRepository implements ApplicationMetricRepositoryInterface
{
    public function create(array $data): ApplicationMetric
    {
        return ApplicationMetric::create($data);
    }

    public function updateOrCreate(array $attributes, array $values = []): ApplicationMetric
    {
        return ApplicationMetric::updateOrCreate($attributes, $values);
    }
}
