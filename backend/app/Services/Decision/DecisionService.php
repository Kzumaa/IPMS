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

                // Calculate expiry date based on app type (Vietnam IP Law)
                // Patent: 20 years from filing date
                // Utility: 10 years from filing date
                // Industrial Design: 5 years from filing date (renewable 2x for max 15 years)
                $filingDate = $application->filing_date ?? now();
                $expiryDate = match ($application->app_type) {
                    \App\Enums\AppType::PATENT => $filingDate->copy()->addYears(20),
                    \App\Enums\AppType::UTILITY => $filingDate->copy()->addYears(10),
                    \App\Enums\AppType::INDUSTRIAL_DESIGN => $filingDate->copy()->addYears(5),
                    default => $filingDate->copy()->addYears(20),
                };

                // Generate Protection Title
                $title = $this->protectionTitleRepository->create([
                    'application_id' => $application->id,
                    'registration_number' => $this->generateRegistrationNumber($application),
                    'issue_date' => now(),
                    'expiry_date' => $expiryDate,
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

    /**
     * Generate a registration number based on app type.
     * Format: {PREFIX}-VN-{YEAR}-{SEQUENCE}
     */
    protected function generateRegistrationNumber(Application $application): string
    {
        $prefix = match ($application->app_type) {
            \App\Enums\AppType::PATENT => 'PAT',
            \App\Enums\AppType::UTILITY => 'UTL',
            \App\Enums\AppType::INDUSTRIAL_DESIGN => 'ID',
            default => 'IP',
        };

        $year = now()->format('Y');
        $sequence = strtoupper(Str::random(6));

        return "{$prefix}-VN-{$year}-{$sequence}";
    }
}
