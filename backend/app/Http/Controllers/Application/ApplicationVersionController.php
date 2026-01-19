<?php

declare(strict_types=1);

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationVersionResource;
use App\Models\Application;
use App\Services\Application\VersioningService;
use Illuminate\Http\JsonResponse;

class ApplicationVersionController extends Controller
{
    protected VersioningService $versioningService;

    public function __construct(VersioningService $versioningService)
    {
        $this->versioningService = $versioningService;
    }

    /**
     * List all versions of an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $versions = $this->versioningService->getVersionHistory($application);

        return response()->json([
            'data' => ApplicationVersionResource::collection($versions),
            'meta' => [
                'current_version' => $application->current_version,
                'total_versions' => $versions->count(),
            ],
        ]);
    }

    /**
     * Get a specific version snapshot.
     */
    public function show(int $applicationId, int $versionNumber): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $version = $this->versioningService->getVersion($application, $versionNumber);

        if (!$version) {
            return response()->json([
                'message' => "Version {$versionNumber} not found.",
            ], 404);
        }

        return response()->json([
            'data' => new ApplicationVersionResource($version),
        ]);
    }

    /**
     * Compare two versions of an application.
     */
    public function compare(int $applicationId, int $versionA, int $versionB): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $comparison = $this->versioningService->compareVersions($application, $versionA, $versionB);

        if (isset($comparison['error'])) {
            return response()->json([
                'message' => $comparison['error'],
            ], 404);
        }

        return response()->json([
            'data' => $comparison,
        ]);
    }
}
