<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationPartyResource;
use App\Models\Application;
use App\Models\ApplicationParty;
use Illuminate\Http\Request;

class ApplicationPartyController extends Controller
{
    public function index($applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $parties = $application->parties()->with('user')->get();

        return response()->json(['data' => ApplicationPartyResource::collection($parties)]);
    }

    public function store(Request $request, $applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'role' => 'required|in:APPLICANT,INVENTOR,REPRESENTATIVE',
            'user_id' => 'nullable|exists:users,id',
            'snapshot_name' => 'nullable|string|max:500',
            'snapshot_address' => 'nullable|string',
            'snapshot_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'id_number' => 'nullable|string|max:50',
            'id_type' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:2',
            'nationality_text' => 'nullable|string|max:100',
            'is_primary' => 'nullable|boolean',
        ]);

        $party = ApplicationParty::create([
            'application_id' => $application->id,
            'role' => $validated['role'],
            'user_id' => $validated['user_id'] ?? null,
            'snapshot_name' => $validated['snapshot_name'] ?? null,
            'snapshot_address' => $validated['snapshot_address'] ?? null,
            'snapshot_email' => $validated['snapshot_email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'id_number' => $validated['id_number'] ?? null,
            'id_type' => $validated['id_type'] ?? null,
            'nationality' => $validated['nationality'] ?? null,
            'nationality_text' => $validated['nationality_text'] ?? null,
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return response()->json(['data' => new ApplicationPartyResource($party->load('user'))], 201);
    }

    public function update(Request $request, $applicationId, $partyId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $party = ApplicationParty::where('application_id', $applicationId)
            ->where('id', $partyId)
            ->firstOrFail();

        $validated = $request->validate([
            'role' => 'nullable|in:APPLICANT,INVENTOR,REPRESENTATIVE',
            'snapshot_name' => 'nullable|string|max:500',
            'snapshot_address' => 'nullable|string',
            'snapshot_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'id_number' => 'nullable|string|max:50',
            'id_type' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:2',
            'nationality_text' => 'nullable|string|max:100',
            'is_primary' => 'nullable|boolean',
        ]);

        $party->update(array_filter($validated, fn($value) => $value !== null));

        return response()->json(['data' => new ApplicationPartyResource($party->load('user'))]);
    }

    public function destroy($applicationId, $partyId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $party = ApplicationParty::where('application_id', $applicationId)
            ->where('id', $partyId)
            ->firstOrFail();

        $party->delete();

        return response()->json(['message' => 'Party deleted successfully.'], 200);
    }
}
