<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\LicenseType;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationRequestResource;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\LicenseService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LicenseController extends Controller
{
    protected LicenseService $licenseService;

    public function __construct(LicenseService $licenseService)
    {
        $this->licenseService = $licenseService;
    }

    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $requests = $this->licenseService->getByApplication($application)
            ->filter(fn($r) => $r->type->value === 'LICENSE')
            ->load(['license', 'license.licensor', 'license.licensee', 'feeQuote', 'creator']);

        return response()->json([
            'data' => ApplicationRequestResource::collection($requests),
        ]);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'licensor_user_id' => 'required|integer|exists:users,id',
            'licensee_user_id' => 'required|integer|exists:users,id',
            'license_type' => 'required|string|in:' . implode(',', array_column(LicenseType::cases(), 'value')),
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after:valid_from',
            'scope_territory' => 'nullable|string|max:255',
            'scope_products' => 'nullable|string',
            'contract_number' => 'nullable|string|max:100',
        ]);

        $licenseRequest = $this->licenseService->createLicense(
            $application,
            Auth::id(),
            $validated['licensor_user_id'],
            $validated['licensee_user_id'],
            LicenseType::from($validated['license_type']),
            Carbon::parse($validated['valid_from']),
            Carbon::parse($validated['valid_to']),
            $validated['scope_territory'] ?? 'VN',
            $validated['scope_products'] ?? null,
            $validated['contract_number'] ?? null
        );

        return response()->json([
            'data' => new ApplicationRequestResource($licenseRequest),
        ], 201);
    }

    public function show(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $request = $this->licenseService->findWithDetails($requestId);

        if (!$request || $request->application_id !== $applicationId) {
            abort(404, 'License request not found.');
        }

        return response()->json([
            'data' => new ApplicationRequestResource($request),
        ]);
    }

    public function destroy(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $licenseRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $this->licenseService->deleteLicense($licenseRequest);

        return response()->json([
            'message' => 'License request deleted successfully.',
        ]);
    }

    public function submit(int $applicationId, int $requestId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $licenseRequest = ApplicationRequest::where('application_id', $applicationId)
            ->where('id', $requestId)
            ->firstOrFail();

        $submittedRequest = $this->licenseService->submitRequest($licenseRequest);

        return response()->json([
            'data' => new ApplicationRequestResource($submittedRequest->load(['license', 'license.licensor', 'license.licensee', 'feeQuote', 'feeQuote.lines'])),
        ]);
    }
}
