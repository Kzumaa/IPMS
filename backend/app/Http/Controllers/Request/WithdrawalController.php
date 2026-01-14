<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Enums\RequestType;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Services\Request\WithdrawalService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WithdrawalController extends Controller
{
    public function __construct(
        private readonly WithdrawalService $withdrawalService
    ) {}

    /**
     * List withdrawals for an application.
     */
    public function index(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $withdrawals = $application->requests()
            ->where('type', RequestType::WITHDRAWAL)
            ->with(['withdrawal', 'feeQuote'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $withdrawals]);
    }

    /**
     * Create a new withdrawal request.
     */
    public function store(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:2000',
            'effective_date' => 'nullable|date|after_or_equal:today',
        ]);

        $effectiveDate = isset($validated['effective_date'])
            ? Carbon::parse($validated['effective_date'])
            : null;

        $withdrawalRequest = $this->withdrawalService->createWithdrawal(
            $application,
            Auth::id(),
            $validated['reason'] ?? null,
            $effectiveDate
        );

        return response()->json([
            'data' => $withdrawalRequest,
            'message' => 'Withdrawal request created successfully.',
        ], 201);
    }

    /**
     * Get a specific withdrawal request.
     */
    public function show(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'withdrawal', 'feeQuote', 'feeQuote.lines', 'attachments'])
            ->where('type', RequestType::WITHDRAWAL)
            ->findOrFail($requestId);

        $this->authorize('view', $request->application);

        return response()->json(['data' => $request]);
    }

    /**
     * Update a draft withdrawal request.
     */
    public function update(Request $request, int $requestId): JsonResponse
    {
        $withdrawalRequest = ApplicationRequest::with(['application', 'withdrawal'])
            ->where('type', RequestType::WITHDRAWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $withdrawalRequest->application);

        if (!$withdrawalRequest->canEdit()) {
            return response()->json([
                'message' => 'Only draft withdrawals can be updated.',
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:2000',
            'effective_date' => 'nullable|date|after_or_equal:today',
        ]);

        $updateData = [];
        if (array_key_exists('reason', $validated)) {
            $updateData['reason'] = $validated['reason'];
        }
        if (isset($validated['effective_date'])) {
            $updateData['effective_date'] = Carbon::parse($validated['effective_date'])->toDateString();
        }

        $withdrawalRequest->withdrawal->update($updateData);

        return response()->json([
            'data' => $withdrawalRequest->load('withdrawal'),
            'message' => 'Withdrawal updated successfully.',
        ]);
    }

    /**
     * Delete a draft withdrawal request.
     */
    public function destroy(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with('application')
            ->where('type', RequestType::WITHDRAWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        $this->withdrawalService->deleteWithdrawal($request);

        return response()->json([
            'message' => 'Withdrawal deleted successfully.',
        ]);
    }

    /**
     * Submit a withdrawal request.
     */
    public function submit(int $requestId): JsonResponse
    {
        $request = ApplicationRequest::with(['application', 'withdrawal'])
            ->where('type', RequestType::WITHDRAWAL)
            ->findOrFail($requestId);

        $this->authorize('update', $request->application);

        if (!$request->canSubmit()) {
            return response()->json([
                'message' => 'Only draft withdrawals can be submitted.',
            ], 400);
        }

        $request->update(['status' => \App\Enums\RequestStatus::SUBMITTED]);

        return response()->json([
            'data' => $request,
            'message' => 'Withdrawal submitted successfully.',
        ]);
    }

    /**
     * Check if an application can be withdrawn.
     */
    public function canWithdraw(int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        return response()->json([
            'can_withdraw' => $this->withdrawalService->canWithdraw($application),
        ]);
    }
}
