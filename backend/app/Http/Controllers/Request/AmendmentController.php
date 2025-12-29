<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\AmendmentSection;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\AmendmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AmendmentController extends Controller
{
    protected AmendmentService $amendmentService;

    public function __construct(AmendmentService $amendmentService)
    {
        $this->amendmentService = $amendmentService;
    }

    /**
     * List all amendment requests for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $requests = $this->amendmentService->getByApplication($application)
            ->filter(fn($r) => $r->type->value === 'AMENDMENT')
            ->load(['amendment', 'feeQuote', 'creator']);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests),
        ]);
    }

    /**
     * Create a new amendment request.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'section' => 'required|string|in:' . implode(',', array_column(AmendmentSection::cases(), 'value')),
            'change_summary' => 'required|string|max:5000',
            'field_name' => 'nullable|string|max:100',
            'old_value' => 'nullable|string',
            'new_value' => 'nullable|string',
        ]);

        $amendmentRequest = $this->amendmentService->createAmendment(
            $application,
            Auth::id(),
            AmendmentSection::from($validated['section']),
            $validated['change_summary'],
            $validated['field_name'] ?? null,
            $validated['old_value'] ?? null,
            $validated['new_value'] ?? null
        );

        return response()->json([
            'data' => new ApplicationRequestResource($amendmentRequest),
        ], 201);
    }

    /**
     * Show a specific amendment request.
     */
    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $request = $this->amendmentService->findWithDetails($requestId);

        if (!$request || $request->application_id !== $applicationId) {
            abort(404, 'Amendment request not found.');
        }

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    /**
     * Update a draft amendment request.
     */
    public function update(Request $request, int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $amendmentRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $validated = $request->validate([
            'section' => 'required|string|in:' . implode(',', array_column(AmendmentSection::cases(), 'value')),
            'change_summary' => 'required|string|max:5000',
            'field_name' => 'nullable|string|max:100',
            'old_value' => 'nullable|string',
            'new_value' => 'nullable|string',
        ]);

        $updatedRequest = $this->amendmentService->updateAmendment(
            $amendmentRequest,
            AmendmentSection::from($validated['section']),
            $validated['change_summary'],
            $validated['field_name'] ?? null,
            $validated['old_value'] ?? null,
            $validated['new_value'] ?? null
        );

        return response()->json([
            'data' => new ApplicationRequestResource($updatedRequest),
        ]);
    }

    /**
     * Delete a draft amendment request.
     */
    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $amendmentRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $this->amendmentService->deleteAmendment($amendmentRequest);

        return response()->json([
            'message' => 'Amendment request deleted successfully.',
        ]);
    }

    /**
     * Submit an amendment request.
     */
    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $amendmentRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $submittedRequest = $this->amendmentService->submitRequest($amendmentRequest);

        return response()->json([
            'data' => new ApplicationRequestResource($submittedRequest->load(['amendment', 'feeQuote', 'feeQuote.lines'])),
        ]);
    }
}
