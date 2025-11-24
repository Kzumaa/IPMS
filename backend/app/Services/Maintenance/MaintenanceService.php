<?php

namespace App\Services\Maintenance;

use App\Models\MaintenanceSchedule;
use App\Models\ProtectionTitle;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
    public function generateSchedule(ProtectionTitle $title): void
    {
        // Simplified logic: Generate fees for Year 1 to Year 20
        $years = range(1, 20);
        $baseAmount = 1000000; // 1 million VND base fee

        foreach ($years as $year) {
            MaintenanceSchedule::create([
                'protection_title_id' => $title->id,
                'year' => $year,
                'due_date' => $title->issue_date->addYears($year - 1), // Due annually from issue date
                'amount' => $baseAmount * $year, // Increasing fee
                'status' => 'PENDING',
            ]);
        }
    }

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
}
