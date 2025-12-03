<?php

namespace App\Repositories\ApplicationMetric;

use App\Models\ApplicationMetric;

interface ApplicationMetricRepositoryInterface
{
    public function create(array $data): ApplicationMetric;
    public function updateOrCreate(array $attributes, array $values = []): ApplicationMetric;
}
