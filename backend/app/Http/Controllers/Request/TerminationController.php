<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\RequestType;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\TerminationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TerminationController extends Controller
{
    public function __construct(
        private readonly TerminationService $terminationService
    ) {}

    /**
     * List terminations for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $terminations = $application->requests()
            ->where('type', RequestType::TERMINATION)
            ->with(['termination', 'feeQuote'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $terminations]);
    }

    /**
     * Create a new termination request.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:2000',
        ]);

        $terminationRequest = $this->terminationService->createTermination(
            $application,
            Auth::id(),
            $validated['reason'] ?? null
        );

        return response()->json([
            'data' => $terminationRequest,
            'message' => 'Termination request created successfully.',
        ], 201);
    }

    /**
     * Get a specific termination request.
     */
    public function show(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'termination', 'feeQuote', 'feeQuote.lines', 'attachments'])
            ->where('type', RequestType::TERMINATION)
            ->findOrFail($requestId);

        $this->authorize('view', $request->application);

        return response()->json(['data' => $request]);
    }

    /**
     * Update a draft termination request.
     */
    public function update(Request $request, int $requestId): JsonResponse
    {
        $terminationRequest = ApplicationRequest::with(['application', 'termination'])
            ->where('type', RequestType::TERMINATION)
            ->findOrFail($requestId);

        $this->authorize('update', $terminationRequest->application);

        if (!$terminationRequest->canEdit()) {
            return response()->json([
                'message' => 'Only draft terminations can be updated.',
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:2000',
        ]);

        $updateData = [];
        if (array_key_exists('reason', $validated)) {
            $updateData['reason'] = $validated['reason'];
        }

        $terminationRequest->termination->update($updateData);

        return response()->json([
            'data' => $terminationRequest->load('termination'),
            'message' => 'Termination updated successfully.',
        ]);
    }

    /**
     * Delete a draft termination request.
     */
    public function destroy(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with('application')
            ->where('type', RequestType::TERMINATION)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        $this->terminationService->deleteTermination($request);

        return response()->json([
            'message' => 'Termination deleted successfully.',
        ]);
    }

    /**
     * Submit a termination request.
     */
    public function submit(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'termination'])
            ->where('type', RequestType::TERMINATION)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        if (!$request->canSubmit()) {
            return response()->json([
                'message' => 'Only draft terminations can be submitted.',
            ], 400);
        }

        $request->update(['status' => \App\Enums\RequestStatus::SUBMITTED]);

        return response()->json([
            'data' => $request,
            'message' => 'Termination submitted successfully.',
        ]);
    }
}
