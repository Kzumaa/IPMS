<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\Application\ApplicationService;
use App\Enums\ApplicationStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    protected $applicationService;
    protected $formalityExamService;
    protected $substantiveExamService;

    public function __construct(
        ApplicationService $applicationService,
        \App\Services\Examination\FormalityExamService $formalityExamService,
        \App\Services\Examination\SubstantiveExamService $substantiveExamService
    ) {
        $this->applicationService = $applicationService;
        $this->formalityExamService = $formalityExamService;
        $this->substantiveExamService = $substantiveExamService;
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
        $application = Application::with(['metrics', 'parties', 'payments', 'attachments'])->findOrFail($id);
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
}
