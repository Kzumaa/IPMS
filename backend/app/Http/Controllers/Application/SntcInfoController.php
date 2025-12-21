<?php

declare(strict_types=1);

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\SntcInfo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SntcInfoController extends Controller
{
    /**
     * Get SNTC info (State Budget Science & Technology Task) for an application.
     */
    public function show(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $sntcInfo = SntcInfo::find($applicationId);

        return response()->json(['data' => $sntcInfo]);
    }

    /**
     * Create or update SNTC info for an application.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'agency_name' => 'nullable|string|max:500',
            'project_name' => 'nullable|string|max:1000',
            'project_code' => 'nullable|string|max:100',
        ]);

        $sntcInfo = SntcInfo::updateOrCreate(
            ['application_id' => $application->id],
            [
                'agency_name' => $validated['agency_name'] ?? null,
                'project_name' => $validated['project_name'] ?? null,
                'project_code' => $validated['project_code'] ?? null,
            ]
        );

        return response()->json(['data' => $sntcInfo], 201);
    }

    /**
     * Delete SNTC info for an application.
     */
    public function destroy(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        SntcInfo::where('application_id', $applicationId)->delete();

        return response()->json(['message' => 'SNTC info deleted successfully']);
    }
}
