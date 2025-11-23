<?php

namespace App\Repositories\ApplicaitonMetric;

use App\Models\Application;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Services\Application\ApplicationServiceInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ApplicationService implements ApplicationServiceInterface
{
    public function __construct(
        protected ApplicationRepositoryInterface $applications,
        protected ApplicationMetricRepositoryInterface $metricsRepo,
        protected ApplicationFeeRepositoryInterface $feesRepo,
        protected MetricServiceInterface $metricService,
        protected FeeServiceInterface $feeService,
    ) {}

    public function createDraft(int $userId, array $validated): Application
    {
        return DB::transaction(function () use ($userId, $validated) {

            // 1) Split main app data vs metric data
            $metricKeys = [
                'description_pages',
                'claims_independent',
                'claims_total',
                'drawings_images',
                'ipc_groups',
                'id_variants',
                'id_images',
            ];

            $metricInput = Arr::only($validated, $metricKeys);
            $applicationData = Arr::except($validated, $metricKeys);

            // 2) Create application
            /** @var Application $application */
            $application = $this->applications->createDraft($userId, $applicationData);

            // 3) Build & save metrics
            $metrics = $this->metricService->buildMetricsFromInput($metricInput);
            $this->metricsRepo->saveForApplication($application->id, $metrics);

            // 4) Calculate fees and save snapshot
            $feeItems = $this->feeService->calculateForApplication($application, $metrics);
            $this->feesRepo->saveSnapshot($application->id, $feeItems);

            // 5) Optionally eager-load summary relations
            $application->load(['metrics', 'fees']);

            return $application;
        });
    }
}
