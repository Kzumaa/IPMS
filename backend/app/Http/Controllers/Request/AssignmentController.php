<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\TransferType;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\AssignmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller
{
    protected AssignmentService $assignmentService;

    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $requests = $this->assignmentService->getByApplication($application)
            ->filter(fn($r) => $r->type->value === 'ASSIGNMENT')
            ->load(['assignment', 'assignment.assignor', 'assignment.assignee', 'feeQuote', 'creator']);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests),
        ]);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'assignor_user_id' => 'required|integer|exists:users,id',
            'assignee_user_id' => 'required|integer|exists:users,id',
            'transfer_type' => 'required|string|in:' . implode(',', array_column(TransferType::cases(), 'value')),
            'contract_number' => 'nullable|string|max:100',
            'contract_date' => 'nullable|date',
        ]);

        $assignmentRequest = $this->assignmentService->createAssignment(
            $application,
            Auth::id(),
            $validated['assignor_user_id'],
            $validated['assignee_user_id'],
            TransferType::from($validated['transfer_type']),
            $validated['contract_number'] ?? null,
            isset($validated['contract_date']) ? Carbon::parse($validated['contract_date']) : null
        );

        return response()->json([
            'data' => new ApplicationRequestResource($assignmentRequest),
        ], 201);
    }

    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $request = $this->assignmentService->findWithDetails($requestId);

        if (!$request || $request->application_id !== $applicationId) {
            abort(404, 'Assignment request not found.');
        }

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $assignmentRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $this->assignmentService->deleteAssignment($assignmentRequest);

        return response()->json([
            'message' => 'Assignment request deleted successfully.',
        ]);
    }

    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $assignmentRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $submittedRequest = $this->assignmentService->submitRequest($assignmentRequest);

        return response()->json([
            'data' => new ApplicationRequestResource($submittedRequest->load(['assignment', 'assignment.assignor', 'assignment.assignee', 'feeQuote', 'feeQuote.lines'])),
        ]);
    }
}
