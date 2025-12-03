<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\Application\ApplicationService;
use App\Services\Examination\FormalityExamService;
use App\Services\Examination\SubstantiveExamService;
use App\Services\Decision\DecisionService;
use App\Services\File\FileMetricService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        return response()->json($application, 201);
    }

    public function show($id)
    {
        $application = Application::with(['metrics', 'parties', 'payments.receiptFile', 'attachments.file'])->findOrFail($id);
        $this->authorize('view', $application);
        return response()->json($application);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        $validated = $request->validate([
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

        return response()->json($application);
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
}
