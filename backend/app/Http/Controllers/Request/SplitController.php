<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\SplitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SplitController extends Controller
{
    protected SplitService $splitService;

    public function __construct(SplitService $splitService)
    {
        $this->splitService = $splitService;
    }

    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $requests = $this->splitService->getByApplication($application)
            ->filter(fn($r) => $r->type->value === 'SPLIT')
            ->load(['feeQuote', 'creator']);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests),
        ]);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'split_description' => 'required|string|max:5000',
        ]);

        $splitRequest = $this->splitService->createSplit(
            $application,
            Auth::id(),
            $validated['split_description']
        );

        return response()->json([
            'data' => new ApplicationRequestResource($splitRequest),
        ], 201);
    }

    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $request = $this->splitService->findWithDetails($requestId);

        if (!$request || $request->application_id !== $applicationId) {
            abort(404, 'Split request not found.');
        }

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $splitRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $this->splitService->deleteSplit($splitRequest);

        return response()->json([
            'message' => 'Split request deleted successfully.',
        ]);
    }

    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $splitRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $submittedRequest = $this->splitService->submitRequest($splitRequest);

        return response()->json([
            'data' => new ApplicationRequestResource($submittedRequest->load(['feeQuote', 'feeQuote.lines'])),
        ]);
    }
}
