<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Application
        $this->app->bind(
            \App\Repositories\Application\ApplicationRepositoryInterface::class,
            \App\Repositories\Application\ApplicationRepository::class
        );
        $this->app->bind(
            \App\Repositories\ApplicationMetric\ApplicationMetricRepositoryInterface::class,
            \App\Repositories\ApplicationMetric\ApplicationMetricRepository::class
        );
        $this->app->bind(
            \App\Repositories\ApplicationParty\ApplicationPartyRepositoryInterface::class,
            \App\Repositories\ApplicationParty\ApplicationPartyRepository::class
        );

        // Examination
        $this->app->bind(
            \App\Repositories\Examination\FormalityExamRecordRepositoryInterface::class,
            \App\Repositories\Examination\FormalityExamRecordRepository::class
        );
        $this->app->bind(
            \App\Repositories\Examination\SubstantiveExamRecordRepositoryInterface::class,
            \App\Repositories\Examination\SubstantiveExamRecordRepository::class
        );

        // Decision
        $this->app->bind(
            \App\Repositories\Decision\DecisionRecordRepositoryInterface::class,
            \App\Repositories\Decision\DecisionRecordRepository::class
        );
        $this->app->bind(
            \App\Repositories\ProtectionTitle\ProtectionTitleRepositoryInterface::class,
            \App\Repositories\ProtectionTitle\ProtectionTitleRepository::class
        );

        // File
        $this->app->bind(
            \App\Repositories\File\FileRepositoryInterface::class,
            \App\Repositories\File\FileRepository::class
        );

        // Assignment
        $this->app->bind(
            \App\Repositories\Assignment\AssignmentRepositoryInterface::class,
            \App\Repositories\Assignment\AssignmentRepository::class
        );

        // Request
        $this->app->bind(
            \App\Repositories\Request\ApplicationRequestRepositoryInterface::class,
            \App\Repositories\Request\ApplicationRequestRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
