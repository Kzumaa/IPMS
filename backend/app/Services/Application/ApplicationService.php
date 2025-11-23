<?php

namespace App\Services\Application;

use App\Models\Application;
use App\Models\ApplicationMetric;
use App\Models\ApplicationParty;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ApplicationService
{
    public function createApplication(array $data): Application
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();

            $application = Application::create([
                'app_type' => $data['app_type'],
                'title' => $data['title'],
                'status' => 'DRAFT',
                'created_by' => $user->id,
                'applicant_is_inventor' => $data['applicant_is_inventor'] ?? false,
                'publication_early_requested' => $data['publication_early_requested'] ?? false,
                'pub_delay_months' => $data['pub_delay_months'] ?? null,
            ]);

            // Create default metrics
            ApplicationMetric::create([
                'application_id' => $application->id,
            ]);

            // Add applicant party
            ApplicationParty::create([
                'application_id' => $application->id,
                'role' => 'APPLICANT',
                'user_id' => $user->id,
                'is_primary' => true,
                'snapshot_name' => $user->name,
                'snapshot_email' => $user->email,
            ]);

            // If applicant is inventor, add inventor party
            if ($application->applicant_is_inventor) {
                ApplicationParty::create([
                    'application_id' => $application->id,
                    'role' => 'INVENTOR',
                    'user_id' => $user->id,
                    'is_primary' => true,
                    'snapshot_name' => $user->name,
                    'snapshot_email' => $user->email,
                ]);
            }

            return $application;
        });
    }

    public function updateApplication(Application $application, array $data): Application
    {
        $application->update($data);
        return $application;
    }

    public function updateMetrics(Application $application, array $data): ApplicationMetric
    {
        $metrics = $application->metrics ?? ApplicationMetric::create(['application_id' => $application->id]);
        $metrics->update($data);
        return $metrics;
    }
}
