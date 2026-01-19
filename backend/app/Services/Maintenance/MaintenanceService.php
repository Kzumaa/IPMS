<?php

namespace App\Services\Maintenance;

use App\Enums\AppType;
use App\Models\MaintenanceSchedule;
use App\Models\ProtectionTitle;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
    /**
     * Generate maintenance schedule based on app type.
     *
     * Vietnam IP Law:
     * - Patent: Annual fees for 20 years
     * - Utility: Annual fees for 10 years
     * - Industrial Design: No annual fees (renewal every 5 years instead)
     */
    public function generateSchedule(ProtectionTitle $title): void
    {
        $application = $title->application;

        // Industrial Designs don't have annual maintenance fees
        // They use 5-year renewals instead
        if ($application->app_type === AppType::INDUSTRIAL_DESIGN) {
            return;
        }

        // Determine max years based on app type
        $maxYears = match ($application->app_type) {
            AppType::PATENT => 20,
            AppType::UTILITY => 10,
            default => 20,
        };

        // Fee amounts per SRS: 100,000 VND / Option (simplified)
        // In practice, fees increase over time
        $baseAmount = 100000;

        foreach (range(1, $maxYears) as $year) {
            // Fee increases: years 1-5 base, 6-10 1.5x, 11-15 2x, 16-20 2.5x
            $multiplier = match (true) {
                $year <= 5 => 1.0,
                $year <= 10 => 1.5,
                $year <= 15 => 2.0,
                default => 2.5,
            };

            MaintenanceSchedule::create([
                'protection_title_id' => $title->id,
                'year' => $year,
                // Due date: anniversary of issue date each year
                // Grace period of 6 months after due date (handled separately)
                'due_date' => $title->issue_date->copy()->addYears($year - 1),
                'amount' => $baseAmount * $multiplier,
                'status' => 'PENDING',
            ]);
        }
    }

    /**
     * Mark a maintenance fee as paid.
     */
    public function payFee(MaintenanceSchedule $schedule): MaintenanceSchedule
    {
        return DB::transaction(function () use ($schedule) {
            $schedule->update([
                'status' => 'PAID',
                'paid_at' => now(),
            ]);
            return $schedule;
        });
    }

    /**
     * Get upcoming maintenance fees for a protection title.
     */
    public function getUpcomingFees(ProtectionTitle $title, int $months = 6): \Illuminate\Database\Eloquent\Collection
    {
        return MaintenanceSchedule::where('protection_title_id', $title->id)
            ->where('status', 'PENDING')
            ->where('due_date', '<=', now()->addMonths($months))
            ->orderBy('due_date')
            ->get();
    }

    /**
     * Check and update overdue fees.
     */
    public function updateOverdueFees(): int
    {
        return MaintenanceSchedule::where('status', 'PENDING')
            ->where('due_date', '<', now())
            ->update(['status' => 'OVERDUE']);
    }
}
