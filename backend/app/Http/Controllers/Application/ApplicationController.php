<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\Application\ApplicationService;
use App\Services\Examination\FormalityExamService;
use App\Services\Examination\SubstantiveExamService;
use App\Services\Decision\DecisionService;
use App\Services\File\FileMetricService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Enums\ApplicationStatus;
use App\Enums\RequestStatus;
use App\Enums\RequestType;

class ApplicationController extends Controller
{
    protected $applicationService;
    protected $formalityExamService;
    protected $substantiveExamService;
    protected $decisionService;
    protected $fileMetricService;

    public function __construct(
        ApplicationService $applicationService,
        FormalityExamService $formalityExamService,
        SubstantiveExamService $substantiveExamService,
        DecisionService $decisionService,
        FileMetricService $fileMetricService
    ) {
        $this->applicationService = $applicationService;
        $this->formalityExamService = $formalityExamService;
        $this->substantiveExamService = $substantiveExamService;
        $this->decisionService = $decisionService;
        $this->fileMetricService = $fileMetricService;
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|string',
            'app_type' => 'nullable|string|in:PATENT,UTILITY,INDUSTRIAL_DESIGN',
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Application::with(['metrics', 'parties'])
            ->where('created_by', Auth::id());

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['app_type'])) {
            $query->where('app_type', $validated['app_type']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('app_no', 'ILIKE', "%{$search}%");
            });
        }

        $perPage = $validated['per_page'] ?? 10;
        $applications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => ApplicationResource::collection($applications->items()),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    /**
     * Get GRANTED applications owned by the current user (My Titles).
     */
    public function grantedTitles()
    {
        $applications = Application::with(['metrics', 'parties', 'substantiveExamRecords'])
            ->where('created_by', Auth::id())
            ->where('status', ApplicationStatus::GRANTED)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => ApplicationResource::collection($applications),
        ]);
    }

    /**
     * Get applications where the current user is a licensee (Licensed to Me).
     */
    public function licensedToMe()
    {
        $userId = Auth::id();

        $applications = Application::with(['metrics', 'parties', 'substantiveExamRecords'])
            ->whereHas('requests', function ($query) use ($userId) {
                $query->where('type', RequestType::LICENSE)
                    ->where('status', RequestStatus::APPROVED)
                    ->whereHas('license.licensees', function ($licenseeQuery) use ($userId) {
                        $licenseeQuery->where('licensee_user_id', $userId);
                    });
            })
            ->with(['requests' => function ($query) use ($userId) {
                $query->where('type', RequestType::LICENSE)
                    ->where('status', RequestStatus::APPROVED)
                    ->whereHas('license.licensees', function ($licenseeQuery) use ($userId) {
                        $licenseeQuery->where('licensee_user_id', $userId);
                    })
                    ->with(['license.licensor', 'license.licensees.licensee']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => ApplicationResource::collection($applications),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'app_type' => 'required|in:PATENT,UTILITY,INDUSTRIAL_DESIGN',
            'title' => 'required|string|max:1000',
            'applicant_is_inventor' => 'boolean',
            'publication_early_requested' => 'boolean',
            'pub_delay_months' => 'nullable|integer|min:0',
        ]);

        $application = $this->applicationService->createApplication($validated);

        return response()->json(['data' => new ApplicationResource($application)], 201);
    }

    public function show($id)
    {
        $application = Application::with([
            'metrics',
            'parties',
            'payments.receiptFile',
            'attachments' => function ($query) {
                $query->where('is_current', true)->with('file');
            },
            'feeQuotes',
            'priorityClaims',
        ])->findOrFail($id);
        $this->authorize('view', $application);
        return response()->json(['data' => new ApplicationResource($application)]);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'app_type' => 'string|in:PATENT,UTILITY,INDUSTRIAL_DESIGN',
            'title' => 'string|max:1000',
            'applicant_is_inventor' => 'boolean',
            'publication_early_requested' => 'boolean',
            'pub_delay_months' => 'nullable|integer|min:0',
            'priority_claims' => 'nullable|array',
            'priority_claims.*.number' => 'required|string',
            'priority_claims.*.country_code' => 'required|string|size:2',
            'priority_claims.*.filing_date' => 'required|date',
            'priority_claims.*.kind' => 'nullable|string',
            'ipc_classes' => 'nullable|array',
            'ipc_classes.*.ipc_code' => 'required|string',
            'ipc_classes.*.version' => 'nullable|string',
            'locarno_classes' => 'nullable|array',
            'locarno_classes.*.class_no' => 'required|string',
            'locarno_classes.*.subclass_no' => 'nullable|string',
            'locarno_classes.*.field_of_use' => 'nullable|string',
        ]);

        $application = $this->applicationService->updateApplication($application, $validated);

        // Reload with all relations for complete response
        $application->load(['metrics', 'parties', 'attachments.file', 'feeQuotes', 'priorityClaims']);

        return response()->json(['data' => new ApplicationResource($application)]);
    }

    public function destroy($id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        if ($application->status !== ApplicationStatus::DRAFT) {
            return response()->json(['message' => 'Only DRAFT applications can be deleted.'], 400);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted successfully.'], 200);
    }

    public function updateMetrics(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'description_pages' => 'integer|min:0',
            'claims_independent' => 'integer|min:0',
            'claims_total' => 'integer|min:0',
            'drawings_images' => 'integer|min:0',
            'ipc_groups' => 'integer|min:0',
            'id_variants' => 'integer|min:0',
            'id_images_per_variant' => 'integer|min:0',
            'has_priority' => 'boolean',
            'priority_count' => 'integer|min:0',
        ]);

        $metrics = $this->applicationService->updateMetrics($application, $validated);

        return response()->json($metrics);
    }

    public function submit($id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        if ($application->status !== ApplicationStatus::DRAFT) {
            return response()->json(['message' => 'Application must be in DRAFT status to submit.'], 400);
        }

        $application = $this->applicationService->submitApplication($application);

        return response()->json($application);
    }

    /**
     * Split an application into a new draft application.
     */
    public function split(Request $request, $id)
    {
        $application = Application::with(['activeParties', 'priorityClaims'])->findOrFail($id);
        $this->authorize('update', $application);

        // Cannot split GRANTED or DECLINED applications
        if (in_array($application->status, [ApplicationStatus::GRANTED, ApplicationStatus::DECLINED])) {
            return response()->json([
                'message' => 'Cannot split an application that has been granted or declined.',
            ], 400);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:1000',
        ]);

        $newApplication = $this->applicationService->splitApplication(
            $application,
            Auth::id(),
            $validated
        );

        // Load relationships for response
        $newApplication->load(['metrics', 'parties', 'priorityClaims']);

        return response()->json([
            'data' => new ApplicationResource($newApplication),
            'message' => 'Application split successfully.',
        ], 201);
    }

    public function completeExamination(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('examine', $application);

        $validated = $request->validate([
            'result' => 'required|in:PASS,FAIL',
            'notes' => 'nullable|string',
        ]);

        $record = $this->formalityExamService->processExaminationResult($application, $validated['result'], $validated['notes'] ?? null);

        return response()->json($record);
    }

    public function completeSubstantiveExamination(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('examine', $application);

        $validated = $request->validate([
            'result' => 'required|in:ACCEPTABLE,REJECTED,OBJECTION',
            'notes' => 'nullable|string',
        ]);

        $record = $this->substantiveExamService->processExaminationResult($application, $validated['result'], $validated['notes'] ?? null);

        return response()->json($record);
    }

    public function issueDecision(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        // Authorization: In real app, check if user has DECISION_MAKER role.
        // For now, reuse 'examine' or allow if user is staff.
        // Let's assume any staff can trigger this for now for simplicity, or reuse 'examine' policy.
        $this->authorize('examine', $application);

        $validated = $request->validate([
            'type' => 'required|in:GRANT,REFUSE',
            'notes' => 'nullable|string',
        ]);

        $record = $this->decisionService->recordDecision($application, $validated['type'], $validated['notes'] ?? null);

        return response()->json($record);
    }

    public function analyze(Request $request, $id)
    {
        $application = Application::with('attachments.file')->findOrFail($id);
        $this->authorize('update', $application);

        $results = [];
        $hasWarnings = false;

        foreach ($application->attachments as $attachment) {
            if (!$attachment->file) continue;

            // Only analyze current attachments
            if (!$attachment->is_current) continue;

            $result = $this->fileMetricService->analyze($attachment->file, $application, $attachment->doc_type);

            $results[] = [
                'file_id' => $attachment->file_id,
                'filename' => $attachment->file->filename,
                'doc_type' => $attachment->doc_type,
                'status' => $result['status'],
                'message' => $result['message'],
                'metrics' => $result['metrics']
            ];

            if ($result['status'] === 'skipped' || $result['status'] === 'failed') {
                $hasWarnings = true;
            }
        }

        // Reload metrics to get updated values
        $application->load('metrics');

        return response()->json([
            'application_metrics' => $application->metrics,
            'file_results' => $results,
            'warning' => $hasWarnings ? 'Some files require manual verification.' : null
        ]);
    }

    /**
     * Publish application (FORMALITY_PASSED → PUBLISHED).
     * Requires publication fee to be paid.
     */
    public function publish(Request $request, $id)
    {
        $application = Application::with(['feeQuotes.lines'])->findOrFail($id);
        $this->authorize('examine', $application);

        // Validate status
        if ($application->status !== ApplicationStatus::FORMALITY_PASSED) {
            return response()->json([
                'message' => 'Application must be in FORMALITY_PASSED status.',
            ], 400);
        }

        // Check publication fee is paid
        $publicationFeePaid = $application->feeQuotes()
            ->where('status', 'PAID')
            ->whereHas('lines', function ($query) {
                $query->where(function ($q) {
                    $q->where('fee_code', 'LIKE', '%PUB%')
                        ->orWhere('label', 'LIKE', '%Publication%')
                        ->orWhere('label', 'LIKE', '%Công bố%');
                });
            })
            ->exists();

        if (!$publicationFeePaid) {
            return response()->json([
                'message' => 'Publication fee must be paid.',
            ], 400);
        }

        // Update status
        $application->update(['status' => ApplicationStatus::PUBLISHED]);

        return response()->json([
            'data' => new ApplicationResource($application),
            'message' => 'Application published successfully.',
        ]);
    }
}
