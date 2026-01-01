<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Application;
use App\Models\FeeQuote;
use App\Models\MaintenanceSchedule;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    /**
     * Create checkout session for application/request fees.
     */
    public function createCheckout(Request $request): JsonResponse
    {
        $request->validate([
            'fee_quote_id' => ['required', 'integer', 'exists:fee_quotes,id'],
            'success_url' => ['required', 'url'],
            'cancel_url' => ['required', 'url'],
        ]);

        $feeQuote = FeeQuote::with('application')->findOrFail($request->fee_quote_id);

        // Check if fee quote is already paid
        if ($feeQuote->status === 'PAID') {
            return response()->json([
                'error' => 'This fee quote has already been paid',
            ], 400);
        }

        // Authorization check - user must own the application
        $application = $feeQuote->application;
        // dd($application->creator(), $request->user()->id);
        if ($application->created_by !== $request->user()->id) {
            return response()->json([
                'error' => 'You are not authorized to pay for this application',
            ], 403);
        }

        $result = $this->paymentService->createCheckoutSession(
            $feeQuote,
            $request->success_url,
            $request->cancel_url,
            $request->user()->email
        );

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Create checkout session for maintenance fees.
     */
    public function createMaintenanceCheckout(Request $request, int $scheduleId): JsonResponse
    {
        $request->validate([
            'success_url' => ['required', 'url'],
            'cancel_url' => ['required', 'url'],
        ]);

        $schedule = MaintenanceSchedule::with('protectionTitle.application')->findOrFail($scheduleId);

        // Check if already paid
        if ($schedule->status === 'PAID') {
            return response()->json([
                'error' => 'This maintenance fee has already been paid',
            ], 400);
        }

        // Authorization check (created_by column)
        $application = $schedule->protectionTitle->application;
        if ($application->created_by !== $request->user()->id) {
            return response()->json([
                'error' => 'You are not authorized to pay for this maintenance fee',
            ], 403);
        }

        $result = $this->paymentService->createMaintenanceCheckoutSession(
            $schedule,
            $request->success_url,
            $request->cancel_url,
            $request->user()->email
        );

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Get payment status by session ID.
     * This endpoint also verifies with Stripe and syncs the status if needed.
     */
    public function status(string $sessionId): JsonResponse
    {
        // Verify with Stripe and sync status if payment is still pending
        $payment = $this->paymentService->verifyAndSyncPaymentStatus($sessionId);

        if (!$payment) {
            return response()->json([
                'error' => 'Payment not found',
            ], 404);
        }

        return response()->json([
            'data' => new PaymentResource($payment->load('feeQuote')),
        ]);
    }

    /**
     * Get all payments for the current user.
     */
    public function myPayments(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get all application IDs for the current user (created_by column)
        $applicationIds = Application::where('created_by', $user->id)
            ->pluck('id');

        $payments = Payment::whereIn('application_id', $applicationIds)
            ->with(['feeQuote', 'application'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => PaymentResource::collection($payments),
        ]);
    }

    /**
     * List payments for an application.
     */
    public function index(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);

        // Authorization check (created_by column)
        if ($application->created_by !== $request->user()->id && !$request->user()->isStaff()) {
            return response()->json([
                'error' => 'You are not authorized to view these payments',
            ], 403);
        }

        $payments = Payment::where('application_id', $applicationId)
            ->with('feeQuote')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => PaymentResource::collection($payments),
        ]);
    }

    /**
     * Show single payment.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $payment = Payment::with(['feeQuote', 'application'])->findOrFail($id);

        // Authorization check (created_by column)
        if ($payment->application->created_by !== $request->user()->id && !$request->user()->isStaff()) {
            return response()->json([
                'error' => 'You are not authorized to view this payment',
            ], 403);
        }

        return response()->json([
            'data' => new PaymentResource($payment),
        ]);
    }

    /**
     * Request refund (staff only).
     */
    public function refund(Request $request, int $id): JsonResponse
    {
        // Staff authorization
        if (!$request->user()->isStaff()) {
            return response()->json([
                'error' => 'Only staff members can process refunds',
            ], 403);
        }

        $request->validate([
            'amount' => ['nullable', 'integer', 'min:1'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $payment = Payment::findOrFail($id);

        try {
            $payment = $this->paymentService->refund(
                $payment,
                $request->amount,
                $request->reason
            );

            return response()->json([
                'data' => new PaymentResource($payment),
                'message' => 'Refund processed successfully',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }
}
