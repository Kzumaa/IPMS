<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\RequestType;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\RenewalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RenewalController extends Controller
{
    public function __construct(
        private readonly RenewalService $renewalService
    ) {}

    /**
     * List renewals for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $renewals = $application->requests()
            ->where('type', RequestType::RENEWAL)
            ->with(['renewal', 'feeQuote'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $renewals]);
    }

    /**
     * Create a new renewal request.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $renewalRequest = $this->renewalService->createRenewal(
            $application,
            Auth::id()
        );

        return response()->json([
            'data' => $renewalRequest,
            'message' => 'Renewal request created successfully.',
        ], 201);
    }

    /**
     * Get a specific renewal request.
     */
    public function show(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'renewal', 'feeQuote', 'feeQuote.lines', 'attachments'])
            ->where('type', RequestType::RENEWAL)
            ->findOrFail($requestId);

        $this->authorize('view', $request->application);

        return response()->json(['data' => $request]);
    }

    /**
     * Update a draft renewal request.
     */
    public function update(Request $request, int $requestId): JsonResponse
    {
        $renewalRequest = ApplicationRequest::with(['application', 'renewal'])
            ->where('type', RequestType::RENEWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $renewalRequest->application);

        if (!$renewalRequest->canEdit()) {
            return response()->json([
                'message' => 'Only draft renewals can be updated.',
            ], 400);
        }

        // Renewal duration is fixed for Industrial Designs, so no update logic for years needed.
        // If we had editable fields (like attachments), we would update them here.
        // For now, just return the request.

        return response()->json([
            'data' => $renewalRequest->load('renewal'),
            'message' => 'Renewal updated successfully.',
        ]);


    }

    /**
     * Delete a draft renewal request.
     */
    public function destroy(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with('application')
            ->where('type', RequestType::RENEWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        $this->renewalService->deleteRenewal($request);

        return response()->json([
            'message' => 'Renewal deleted successfully.',
        ]);
    }

    /**
     * Submit a renewal request.
     */
    public function submit(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'renewal'])
            ->where('type', RequestType::RENEWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        if (!$request->canSubmit()) {
            return response()->json([
                'message' => 'Only draft renewals can be submitted.',
            ], 400);
        }

        $request->update(['status' => \App\Enums\RequestStatus::SUBMITTED]);

        return response()->json([
            'data' => $request,
            'message' => 'Renewal submitted successfully.',
        ]);
    }
}
