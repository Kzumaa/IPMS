<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\DecisionRecord;
use App\Services\Request\AppealService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppealController extends Controller
{
    protected AppealService $appealService;

    public function __construct(AppealService $appealService)
    {
        $this->appealService = $appealService;
    }

    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $requests = $this->appealService->getByApplication($application)
            ->filter(fn($r) => $r->type->value === 'APPEAL')
            ->load(['appeal', 'appeal.targetDecision', 'feeQuote', 'creator']);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests),
        ]);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'target_decision_id' => 'required_without:target_event_id|integer|exists:decision_records,id',
            'target_event_id' => 'required_without:target_decision_id|integer',
            'notice_date' => 'required_with:target_event_id|date',
            'grounds' => 'required|string|max:10000',
        ]);

        if (isset($validated['target_decision_id'])) {
            $decision = DecisionRecord::findOrFail($validated['target_decision_id']);
            $appealRequest = $this->appealService->createAppealForDecision(
                $application,
                Auth::id(),
                $decision,
                $validated['grounds']
            );
        } else {
            $appealRequest = $this->appealService->createAppealForNotice(
                $application,
                Auth::id(),
                $validated['target_event_id'],
                $validated['grounds'],
                Carbon::parse($validated['notice_date'])
            );
        }

        return response()->json([
            'data' => new ApplicationRequestResource($appealRequest),
        ], 201);
    }

    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $request = $this->appealService->findWithDetails($requestId);

        if (!$request || $request->application_id !== $applicationId) {
            abort(404, 'Appeal request not found.');
        }

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $appealRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $this->appealService->deleteAppeal($appealRequest);

        return response()->json([
            'message' => 'Appeal request deleted successfully.',
        ]);
    }

    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $appealRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $submittedRequest = $this->appealService->submitRequest($appealRequest);

        return response()->json([
            'data' => new ApplicationRequestResource($submittedRequest->load(['appeal', 'appeal.targetDecision', 'feeQuote', 'feeQuote.lines'])),
        ]);
    }
}
