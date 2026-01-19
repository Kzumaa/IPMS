<?php

declare(strict_types=1);

namespace App\Http\Controllers\Staff;

use App\Enums\ComplaintResolution;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\ApplicationRequest;
use App\Models\RequestExaminationRecord;
use App\Services\Request\AmendmentService;
use App\Services\Request\AssignmentService;
use App\Services\Request\ComplaintService;
use App\Services\Request\LicenseService;
use App\Services\Request\RenewalService;
use App\Services\Request\SplitService;
use App\Services\Request\TerminationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RequestExaminationController extends Controller
{
    protected AmendmentService $amendmentService;
    protected AssignmentService $assignmentService;
    protected LicenseService $licenseService;
    protected SplitService $splitService;
    protected ComplaintService $complaintService;
    protected RenewalService $renewalService;
    protected TerminationService $terminationService;

    public function __construct(
        AmendmentService $amendmentService,
        AssignmentService $assignmentService,
        LicenseService $licenseService,
        SplitService $splitService,
        ComplaintService $complaintService,
        RenewalService $renewalService,
        TerminationService $terminationService
    ) {
        $this->amendmentService = $amendmentService;
        $this->assignmentService = $assignmentService;
        $this->licenseService = $licenseService;
        $this->splitService = $splitService;
        $this->complaintService = $complaintService;
        $this->renewalService = $renewalService;
        $this->terminationService = $terminationService;
    }

    /**
     * List all pending requests for staff review.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'nullable|string|in:' . implode(',', array_column(RequestType::cases(), 'value')),
            'status' => 'nullable|string|in:' . implode(',', array_column(RequestStatus::cases(), 'value')),
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = ApplicationRequest::with([
            'application',
            'creator',
            'amendment',
            // 'assignment',
            'license',
            'complaint',
            'renewal',
            'termination',
            'feeQuote',
        ]);

        // By default, show submitted requests (pending review)
        $status = $validated['status'] ?? RequestStatus::SUBMITTED->value;
        $query->where('status', $status);

        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        // Only show requests where fee is paid
        $query->whereHas('feeQuote', function ($q) {
            $q->where('status', 'PAID');
        });

        $perPage = $validated['per_page'] ?? 20;
        $requests = $query->orderBy('request_date', 'asc')->paginate($perPage);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests->items()),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Show a specific request for review.
     */
    public function show(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with([
            'application',
            'creator',
            'amendment',
            'amendment.pendingVersion',
            // 'assignment',
            // 'assignment.assignor',
            // 'assignment.assignee',
            'license',
            'license.licensor',
            'license.licensees.licensee',
            'appeal',
            'complaint',
            'renewal',
            'termination',
            'attachments',
            'attachments.file',
            'feeQuote',
            'feeQuote.lines',
        ])->findOrFail($requestId);

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    /**
     * Start examining a request.
     */
    public function startExamination(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::findOrFail($requestId);

        if ($request->status !== RequestStatus::SUBMITTED) {
            return response()->json([
                'message' => 'Only submitted requests can be examined.',
            ], 400);
        }

        $staffId = Auth::id();

        $request->update([
            'status' => RequestStatus::EXAMINING,
            'processed_by' => $staffId,
        ]);

        // Create examination record
        RequestExaminationRecord::create([
            'request_id' => $request->id,
            'examined_by' => $staffId,
            'action' => 'STARTED',
            'notes' => 'Started examination',
            'examined_at' => now(),
        ]);

        return response()->json([
            'data' => new ApplicationRequestResource($request->fresh()),
        ]);
    }

    /**
     * Approve a request.
     */
    public function approve(Request $request, int $requestId): JsonResponse
    {
        $applicationRequest = ApplicationRequest::findOrFail($requestId);
        $staffId = Auth::id();

        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
        ]);

        $service = $this->getServiceForType($applicationRequest->type);
        $approvedRequest = $service->approveRequest(
            $applicationRequest,
            $staffId,
            $validated['notes'] ?? null
        );

        // Create examination record
        RequestExaminationRecord::create([
            'request_id' => $approvedRequest->id,
            'examined_by' => $staffId,
            'action' => 'APPROVED',
            'notes' => $validated['notes'] ?? 'Request approved',
            'examined_at' => now(),
        ]);

        return response()->json([
            'data' => new ApplicationRequestResource($approvedRequest->load(['amendment', 'assignment', 'license', 'complaint', 'renewal', 'termination'])),
            'message' => 'Request approved successfully.',
        ]);
    }

    /**
     * Refuse a request.
     */
    public function refuse(Request $request, int $requestId): JsonResponse
    {
        $applicationRequest = ApplicationRequest::findOrFail($requestId);
        $staffId = Auth::id();

        $validated = $request->validate([
            'notes' => 'required|string|max:5000',
        ]);

        $service = $this->getServiceForType($applicationRequest->type);
        $refusedRequest = $service->refuseRequest(
            $applicationRequest,
            $staffId,
            $validated['notes']
        );

        // Create examination record
        RequestExaminationRecord::create([
            'request_id' => $refusedRequest->id,
            'examined_by' => $staffId,
            'action' => 'REFUSED',
            'notes' => $validated['notes'],
            'examined_at' => now(),
        ]);

        return response()->json([
            'data' => new ApplicationRequestResource($refusedRequest),
            'message' => 'Request refused.',
        ]);
    }

    /**
     * Resolve a complaint with specific resolution.
     */
    public function resolveComplaint(Request $request, int $requestId): JsonResponse
    {
        $applicationRequest = ApplicationRequest::findOrFail($requestId);

        if ($applicationRequest->type !== RequestType::COMPLAINT) {
            return response()->json([
                'message' => 'This endpoint is only for complaint requests.',
            ], 400);
        }

        $staffId = Auth::id();

        $validated = $request->validate([
            'resolution' => 'required|string|in:' . implode(',', array_column(ComplaintResolution::cases(), 'value')),
            'notes' => 'nullable|string|max:5000',
        ]);

        $resolvedRequest = $this->complaintService->resolveComplaint(
            $applicationRequest,
            $staffId,
            ComplaintResolution::from($validated['resolution']),
            $validated['notes'] ?? null
        );

        return response()->json([
            'data' => new ApplicationRequestResource($resolvedRequest->load(['complaint'])),
            'message' => 'Complaint resolved.',
        ]);
    }

    /**
     * Get the appropriate service for a request type.
     */
    private function getServiceForType(RequestType $type): AmendmentService|AssignmentService|LicenseService|SplitService|ComplaintService|RenewalService|TerminationService
    {
        return match ($type) {
            RequestType::AMENDMENT => $this->amendmentService,
            RequestType::ASSIGNMENT => $this->assignmentService,
            RequestType::LICENSE => $this->licenseService,
            RequestType::SPLIT => $this->splitService,
            RequestType::COMPLAINT => $this->complaintService,
            RequestType::RENEWAL => $this->renewalService,
            RequestType::TERMINATION => $this->terminationService,
            default => $this->amendmentService,
        };
    }
}
