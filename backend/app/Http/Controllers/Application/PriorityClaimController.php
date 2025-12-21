<?php

declare(strict_types=1);

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\PriorityClaim;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PriorityClaimController extends Controller
{
    /**
     * Get all priority claims for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $claims = $application->priorityClaims()->get();

        return response()->json(['data' => $claims]);
    }

    /**
     * Add a priority claim to an application.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'kind' => 'nullable|string|in:VN_FIRST,PARIS,OTHER',
            'number' => 'required|string|max:100',
            'filing_date' => 'required|date',
            'country_code' => 'required|string|size:2',
            'agreement_name' => 'nullable|string|max:255',
        ]);

        $claim = PriorityClaim::create([
            'application_id' => $application->id,
            'kind' => $validated['kind'] ?? null,
            'number' => $validated['number'],
            'filing_date' => $validated['filing_date'],
            'country_code' => $validated['country_code'],
            'agreement_name' => $validated['agreement_name'] ?? null,
        ]);

        return response()->json(['data' => $claim], 201);
    }

    /**
     * Update a priority claim.
     */
    public function update(Request $request, int $applicationId, int $claimId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $claim = PriorityClaim::where('application_id', $applicationId)
            ->where('id', $claimId)
            ->firstOrFail();

        $validated = $request->validate([
            'kind' => 'nullable|string|in:VN_FIRST,PARIS,OTHER',
            'number' => 'sometimes|required|string|max:100',
            'filing_date' => 'sometimes|required|date',
            'country_code' => 'sometimes|required|string|size:2',
            'agreement_name' => 'nullable|string|max:255',
        ]);

        $claim->update($validated);

        return response()->json(['data' => $claim]);
    }

    /**
     * Delete a priority claim.
     */
    public function destroy(int $applicationId, int $claimId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $claim = PriorityClaim::where('application_id', $applicationId)
            ->where('id', $claimId)
            ->firstOrFail();

        $claim->delete();

        return response()->json(['message' => 'Priority claim deleted successfully']);
    }
}
