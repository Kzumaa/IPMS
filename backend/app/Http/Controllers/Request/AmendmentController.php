<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\AmendmentSection;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Http\Resources\PendingVersionResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Application\AmendmentVersionService;
use App\Services\Request\AmendmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AmendmentController extends Controller
{
    protected AmendmentService $amendmentService;
    protected AmendmentVersionService $versionService;

    public function __construct(
        AmendmentService $amendmentService,
        AmendmentVersionService $versionService
    ) {
        $this->amendmentService = $amendmentService;
        $this->versionService = $versionService;
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

        // Load pending version for edit-mode amendments
        $request->load('amendment.pendingVersion');

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

    /**
     * Get application data formatted for amendment editing (edit-mode).
     */
    public function getAmendmentData(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        // Check if there's already a pending amendment
        if ($this->versionService->hasPendingAmendment($application)) {
            return response()->json([
                'error' => 'Application already has a pending amendment.',
                'has_pending' => true,
            ], 422);
        }

        $amendmentData = $this->versionService->getAmendmentData($application);

        return response()->json([
            'data' => $amendmentData,
        ]);
    }

    /**
     * Create an edit-mode amendment with proposed changes.
     */
    public function storeEditMode(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        // Check if there's already a pending amendment
        if ($this->versionService->hasPendingAmendment($application)) {
            return response()->json([
                'error' => 'Application already has a pending amendment.',
            ], 422);
        }

        // Handle FormData with files - proposed_data comes as JSON string
        $proposedData = $request->input('proposed_data');
        if (is_string($proposedData)) {
            $proposedData = json_decode($proposedData, true);
        }

        // Parse removed_attachment_ids if it's a JSON string
        $removedAttachmentIds = $request->input('removed_attachment_ids', []);
        if (is_string($removedAttachmentIds)) {
            $removedAttachmentIds = json_decode($removedAttachmentIds, true) ?? [];
        }

        $validated = $request->validate([
            'change_summary' => 'required|string|max:5000',
            'attachments' => 'nullable|array',
            'attachments.*.file' => 'nullable|file|max:10240',
            'attachments.*.doc_type' => 'nullable|string',
        ]);

        // Validate proposed_data manually since it might be parsed from JSON
        if (!is_array($proposedData)) {
            return response()->json([
                'error' => 'Invalid proposed_data format.',
            ], 422);
        }

        // Get uploaded files with their doc_types
        $uploadedFiles = [];
        $attachmentsInput = $request->input('attachments', []);
        foreach ($attachmentsInput as $index => $item) {
            if ($request->hasFile("attachments.{$index}.file")) {
                $uploadedFiles[] = [
                    'file' => $request->file("attachments.{$index}.file"),
                    'doc_type' => $item['doc_type'] ?? 'OTHER',
                ];
            }
        }

        $amendmentRequest = $this->amendmentService->createEditModeAmendment(
            $application,
            Auth::id(),
            $proposedData,
            $validated['change_summary'],
            $uploadedFiles,
            $removedAttachmentIds
        );

        return response()->json([
            'data' => new ApplicationRequestResource($amendmentRequest->load([
                'amendment',
                'amendment.pendingVersion',
                'feeQuote',
                'feeQuote.lines',
            ])),
        ], 201);
    }

    /**
     * Get pending version for an application (staff review).
     */
    public function getPendingVersion(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $pendingVersion = $this->versionService->getPendingVersion($application);

        if (!$pendingVersion) {
            return response()->json([
                'data' => null,
                'message' => 'No pending version found.',
            ]);
        }

        return response()->json([
            'data' => new PendingVersionResource($pendingVersion),
        ]);
    }
}
