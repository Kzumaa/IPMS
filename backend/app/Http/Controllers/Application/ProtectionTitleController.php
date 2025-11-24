<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceSchedule;
use App\Models\ProtectionTitle;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;

class ProtectionTitleController extends Controller
{
    protected $maintenanceService;

    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    public function getSchedule($id)
    {
        $title = ProtectionTitle::with('application')->findOrFail($id);
        // Authorization: Check if user can view application
        $this->authorize('view', $title->application);

        $schedule = MaintenanceSchedule::where('protection_title_id', $id)->orderBy('year')->get();

        return response()->json($schedule);
    }

    public function payFee(Request $request, $id)
    {
        $schedule = MaintenanceSchedule::with('protectionTitle.application')->findOrFail($id);
        $this->authorize('update', $schedule->protectionTitle->application); // Assuming payer can update application

        $schedule = $this->maintenanceService->payFee($schedule);

        return response()->json($schedule);
    }
}
