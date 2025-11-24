<?php

namespace App\Services\Decision;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\DecisionRecord;
use App\Models\ProtectionTitle;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DecisionService
{
    protected $maintenanceService;

    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    public function recordDecision(Application $application, string $type, ?string $notes): DecisionRecord
    {
        return DB::transaction(function () use ($application, $type, $notes) {
            // 1. Create Decision Record
            $record = DecisionRecord::create([
                'application_id' => $application->id,
                'decision_date' => now(),
                'type' => $type,
                'notes' => $notes,
            ]);

            // 2. Handle Grant
            if ($type === 'GRANT') {
                // Ensure status is GRANTED
                if ($application->status !== ApplicationStatus::GRANTED) {
                     $application->update(['status' => ApplicationStatus::GRANTED]);
                }

                // Generate Protection Title
                $title = ProtectionTitle::create([
                    'application_id' => $application->id,
                    'registration_number' => 'VN-' . strtoupper(Str::random(8)), // Simplified generation
                    'issue_date' => now(),
                    'expiry_date' => now()->addYears(20), // Simplified: 20 years for all
                    'status' => 'ACTIVE',
                ]);

                // Generate Maintenance Schedule
                $this->maintenanceService->generateSchedule($title);
            } elseif ($type === 'REFUSE') {
                // Ensure status is REFUSED
                if ($application->status !== ApplicationStatus::REFUSED) {
                    $application->update(['status' => ApplicationStatus::REFUSED]);
                }
            }

            return $record;
        });
    }
}
