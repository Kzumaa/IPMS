<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\ComplaintResolution;
use App\Enums\RequestType;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\ComplaintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    public function __construct(
        private readonly ComplaintService $complaintService
    ) {}

    /**
     * List complaints for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $complaints = $application->requests()
            ->where('type', RequestType::COMPLAINT)
            ->with(['complaint', 'feeQuote'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $complaints,
            'remaining_complaints' => $this->complaintService->getRemainingComplaints($application),
        ]);
    }

    /**
     * Create a new complaint request.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'grounds' => 'required|string|min:10|max:5000',
        ]);

        $complaintRequest = $this->complaintService->createComplaint(
            $application,
            Auth::id(),
            $validated['grounds']
        );

        return response()->json([
            'data' => $complaintRequest,
            'message' => 'Complaint created successfully.',
        ], 201);
    }

    /**
     * Get a specific complaint request.
     */
    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'complaint', 'feeQuote', 'feeQuote.lines', 'attachments'])
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('view', $request->application);

        return response()->json(['data' => $request]);
    }

    /**
     * Update a draft complaint request.
     */
    public function update(Request $request, int $requestId): JsonResponse
    {
        $complaintRequest = ApplicationRequest::with(['application', 'complaint'])
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('update', $complaintRequest->application);

        if (!$complaintRequest->canEdit()) {
            return response()->json([
                'message' => 'Only draft complaints can be updated.',
            ], 400);
        }

        $validated = $request->validate([
            'grounds' => 'required|string|min:10|max:5000',
        ]);

        $complaintRequest->complaint->update([
            'grounds' => $validated['grounds'],
        ]);

        return response()->json([
            'data' => $complaintRequest->load('complaint'),
            'message' => 'Complaint updated successfully.',
        ]);
    }

    /**
     * Delete a draft complaint request.
     */
    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with('application')
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        $this->complaintService->deleteComplaint($request);

        return response()->json([
            'message' => 'Complaint deleted successfully.',
        ]);
    }

    /**
     * Submit a complaint request.
     */
    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'complaint'])
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        if (!$request->canSubmit()) {
            return response()->json([
                'message' => 'Only draft complaints can be submitted.',
            ], 400);
        }

        $request->update(['status' => \App\Enums\RequestStatus::SUBMITTED]);

        return response()->json([
            'data' => $request,
            'message' => 'Complaint submitted successfully.',
        ]);
    }

    /**
     * Start examination of a complaint (staff action).
     */
    public function startExamination(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with('application')
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('examine', $request->application);

        $request = $this->complaintService->startExamination($request, Auth::id());

        return response()->json([
            'data' => $request,
            'message' => 'Examination started.',
        ]);
    }

    /**
     * Resolve a complaint (staff action).
     */
    public function resolve(Request $request, int $requestId): JsonResponse
    {
        $complaintRequest = ApplicationRequest::with(['application', 'complaint'])
            ->where('type', RequestType::COMPLAINT)
            ->findOrFail($requestId);

        $this->authorize('examine', $complaintRequest->application);

        $validated = $request->validate([
            'resolution' => 'required|in:ACCEPTED,REJECTED',
            'notes' => 'nullable|string|max:5000',
        ]);

        $resolution = ComplaintResolution::from($validated['resolution']);

        $complaintRequest = $this->complaintService->resolveComplaint(
            $complaintRequest,
            Auth::id(),
            $resolution,
            $validated['notes'] ?? null
        );

        return response()->json([
            'data' => $complaintRequest->load('complaint'),
            'message' => 'Complaint resolved successfully.',
        ]);
    }
}
