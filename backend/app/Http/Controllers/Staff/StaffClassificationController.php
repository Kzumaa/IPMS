<?php

declare(strict_types=1);

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Services\Examination\ClassificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StaffClassificationController extends Controller
{
    protected ClassificationService $classificationService;

    public function __construct(ClassificationService $classificationService)
    {
        $this->classificationService = $classificationService;
    }

    /**
     * Get classification summary for an application.
     */
    public function show(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('examine', $application);

        $summary = $this->classificationService->getClassificationSummary($application);

        return response()->json([
            'data' => $summary,
        ]);
    }

    /**
     * Assign classification to an application.
     * For Patent/Utility: IPC classes
     * For Industrial Design: Locarno classes
     */
    public function assign(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('examine', $application);

        // Validate based on application type
        $appType = $application->app_type->value;

        if (in_array($appType, ['PATENT', 'UTILITY'])) {
            $validated = $request->validate([
                'ipc_classes' => 'required|array|min:1',
                'ipc_classes.*.ipc_code' => 'required|string|max:50',
                'ipc_classes.*.version' => 'nullable|string|max:20',
                'recalculate_fees' => 'boolean',
            ]);

            $staffId = Auth::guard('staff')->id();
            $application = $this->classificationService->assignIpcClasses(
                $application,
                $validated['ipc_classes'],
                $staffId
            );
        } else {
            // Industrial Design
            $validated = $request->validate([
                'locarno_classes' => 'required|array|min:1',
                'locarno_classes.*.class_no' => 'required|string|max:10',
                'locarno_classes.*.subclass_no' => 'nullable|string|max:10',
                'locarno_classes.*.version' => 'nullable|string|max:20',
                'locarno_classes.*.field_of_use' => 'nullable|string|max:255',
                'recalculate_fees' => 'boolean',
            ]);

            $staffId = Auth::guard('staff')->id();
            $application = $this->classificationService->assignLocarnoClasses(
                $application,
                $validated['locarno_classes'],
                $staffId
            );
        }

        // Optionally recalculate fees
        $newFeeQuote = null;
        if ($request->boolean('recalculate_fees', false)) {
            $newFeeQuote = $this->classificationService->recalculateFeesAfterClassification($application);
        }

        // Get updated summary
        $summary = $this->classificationService->getClassificationSummary($application);

        return response()->json([
            'data' => $summary,
            'fee_quote' => $newFeeQuote ? [
                'id' => $newFeeQuote->id,
                'total_amount' => $newFeeQuote->total_amount,
                'status' => $newFeeQuote->status,
            ] : null,
            'message' => 'Classification assigned successfully.',
        ]);
    }
}
