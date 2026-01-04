<?php

namespace App\Services\Decision;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\DecisionRecord;
use App\Models\ProtectionTitle;
use App\Repositories\Decision\DecisionRecordRepositoryInterface;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\ProtectionTitle\ProtectionTitleRepositoryInterface;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DecisionService
{
    protected $maintenanceService;
    protected $decisionRecordRepository;
    protected $applicationRepository;
    protected $protectionTitleRepository;

    public function __construct(
        MaintenanceService $maintenanceService,
        DecisionRecordRepositoryInterface $decisionRecordRepository,
        ApplicationRepositoryInterface $applicationRepository,
        ProtectionTitleRepositoryInterface $protectionTitleRepository
    ) {
        $this->maintenanceService = $maintenanceService;
        $this->decisionRecordRepository = $decisionRecordRepository;
        $this->applicationRepository = $applicationRepository;
        $this->protectionTitleRepository = $protectionTitleRepository;
    }

    public function recordDecision(Application $application, string $type, ?string $notes): DecisionRecord
    {
        // Block decision if application is under post-grant amendment review
        if ($application->status === ApplicationStatus::UNDER_AMENDMENT) {
            throw ValidationException::withMessages([
                'status' => 'Cannot perform examination while post-grant amendment is under review.',
            ]);
        }

        return DB::transaction(function () use ($application, $type, $notes) {
            // 1. Create Decision Record
            $record = $this->decisionRecordRepository->create([
                'application_id' => $application->id,
                'decision_date' => now(),
                'type' => $type,
                'notes' => $notes,
            ]);

            // 2. Handle Grant
            if ($type === 'GRANT') {
                // Ensure status is GRANTED
                if ($application->status !== ApplicationStatus::GRANTED) {
                     $this->applicationRepository->update($application, ['status' => ApplicationStatus::GRANTED]);
                }

                // Generate Protection Title
                $title = $this->protectionTitleRepository->create([
                    'application_id' => $application->id,
                    'registration_number' => 'VN-' . strtoupper(Str::random(8)), // Simplified generation
                    'issue_date' => now(),
                    'expiry_date' => now()->addYears(20), // Simplified: 20 years for all
                    'status' => 'ACTIVE',
                ]);

                // Generate Maintenance Schedule
                $this->maintenanceService->generateSchedule($title);
            } elseif ($type === 'REFUSE') {
                // Ensure status is DECLINED
                if ($application->status !== ApplicationStatus::DECLINED) {
                    $this->applicationRepository->update($application, ['status' => ApplicationStatus::DECLINED]);
                }
            }

            return $record;
        });
    }
}
