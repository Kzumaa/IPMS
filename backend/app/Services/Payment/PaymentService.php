<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\FeeQuote;
use App\Models\MaintenanceSchedule;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Stripe\Checkout\Session;
use Stripe\Refund;
use Stripe\Stripe;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Checkout session for a fee quote.
     *
     * @return array{session_id: string, session_url: string, payment_id: int}
     */
    public function createCheckoutSession(
        FeeQuote $feeQuote,
        string $successUrl,
        string $cancelUrl,
        ?string $customerEmail = null
    ): array {
        return DB::transaction(function () use ($feeQuote, $successUrl, $cancelUrl, $customerEmail) {
            // Create pending payment record
            $payment = Payment::create([
                'application_id' => $feeQuote->application_id,
                'fee_quote_id' => $feeQuote->id,
                'amount' => $feeQuote->total_amount,
                'currency' => strtolower($feeQuote->currency),
                'method' => PaymentMethod::STRIPE,
                'status' => PaymentStatus::PENDING,
                'description' => $this->generateDescription($feeQuote),
                'expires_at' => now()->addMinutes(30),
            ]);

            // Build line items for Stripe
            $lineItems = $this->buildLineItems($feeQuote);

            // Create Stripe Checkout Session
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $cancelUrl,
                'customer_email' => $customerEmail,
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'fee_quote_id' => (string) $feeQuote->id,
                    'application_id' => (string) $feeQuote->application_id,
                    'request_id' => $feeQuote->request_id ? (string) $feeQuote->request_id : null,
                ],
                'expires_at' => now()->addMinutes(30)->timestamp,
            ]);

            // Update payment with session ID
            $payment->update(['stripe_session_id' => $session->id]);

            return [
                'session_id' => $session->id,
                'session_url' => $session->url,
                'payment_id' => $payment->id,
            ];
        });
    }

    /**
     * Create a Stripe Checkout session for maintenance fee.
     *
     * @return array{session_id: string, session_url: string, payment_id: int}
     */
    public function createMaintenanceCheckoutSession(
        MaintenanceSchedule $schedule,
        string $successUrl,
        string $cancelUrl,
        ?string $customerEmail = null
    ): array {
        return DB::transaction(function () use ($schedule, $successUrl, $cancelUrl, $customerEmail) {
            $protectionTitle = $schedule->protectionTitle;

            $payment = Payment::create([
                'application_id' => $protectionTitle->application_id,
                'amount' => $schedule->amount,
                'currency' => 'vnd',
                'method' => PaymentMethod::STRIPE,
                'status' => PaymentStatus::PENDING,
                'description' => "Maintenance fee Year {$schedule->year} for {$protectionTitle->registration_number}",
                'expires_at' => now()->addMinutes(30),
                'metadata' => [
                    'maintenance_schedule_id' => $schedule->id,
                    'protection_title_id' => $protectionTitle->id,
                ],
            ]);

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'vnd',
                        'product_data' => [
                            'name' => "Maintenance Fee - Year {$schedule->year}",
                            'description' => "Registration: {$protectionTitle->registration_number}",
                        ],
                        'unit_amount' => (int) $schedule->amount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $cancelUrl,
                'customer_email' => $customerEmail,
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'maintenance_schedule_id' => (string) $schedule->id,
                    'protection_title_id' => (string) $protectionTitle->id,
                ],
                'expires_at' => now()->addMinutes(30)->timestamp,
            ]);

            $payment->update(['stripe_session_id' => $session->id]);

            return [
                'session_id' => $session->id,
                'session_url' => $session->url,
                'payment_id' => $payment->id,
            ];
        });
    }

    /**
     * Process successful payment from webhook.
     */
    public function handlePaymentSuccess(string $sessionId, string $paymentIntentId): Payment
    {
        return DB::transaction(function () use ($sessionId, $paymentIntentId) {
            $payment = Payment::byStripeSession($sessionId)->firstOrFail();

            $payment->markAsCompleted($paymentIntentId);

            // Update related entities
            $this->updateRelatedEntities($payment);

            return $payment;
        });
    }

    /**
     * Handle payment failure.
     */
    public function handlePaymentFailure(string $sessionId): Payment
    {
        $payment = Payment::byStripeSession($sessionId)->firstOrFail();

        $payment->markAsFailed();

        return $payment;
    }

    /**
     * Handle session expiration.
     */
    public function handleSessionExpired(string $sessionId): Payment
    {
        $payment = Payment::byStripeSession($sessionId)->firstOrFail();

        $payment->markAsExpired();

        return $payment;
    }

    /**
     * Process refund.
     */
    public function refund(Payment $payment, ?int $amount = null, ?string $reason = null): Payment
    {
        if (!$payment->canRefund()) {
            throw new \InvalidArgumentException('This payment cannot be refunded');
        }

        if (!$payment->stripe_payment_intent_id) {
            throw new \InvalidArgumentException('No Stripe payment intent found for this payment');
        }

        $refundParams = [
            'payment_intent' => $payment->stripe_payment_intent_id,
        ];

        if ($amount !== null) {
            $refundParams['amount'] = $amount;
        }

        if ($reason !== null) {
            $refundParams['reason'] = $reason;
        }

        $refund = Refund::create($refundParams);

        $newStatus = $amount && $amount < (int) $payment->amount
            ? PaymentStatus::PARTIALLY_REFUNDED
            : PaymentStatus::REFUNDED;

        $payment->update([
            'status' => $newStatus,
            'metadata' => array_merge($payment->metadata ?? [], [
                'refund_id' => $refund->id,
                'refund_amount' => $refund->amount,
                'refunded_at' => now()->toISOString(),
            ]),
        ]);

        return $payment->fresh();
    }

    /**
     * Get payment by session ID.
     */
    public function getBySessionId(string $sessionId): ?Payment
    {
        return Payment::byStripeSession($sessionId)->first();
    }

    /**
     * Verify payment status with Stripe and update if needed.
     * This is useful when webhooks are delayed or not received (local dev).
     */
    public function verifyAndSyncPaymentStatus(string $sessionId): ?Payment
    {
        $payment = $this->getBySessionId($sessionId);

        if (!$payment) {
            return null;
        }

        // If already in a terminal state, no need to verify
        if ($payment->status->isTerminal()) {
            return $payment;
        }

        // Fetch session from Stripe to check actual status
        try {
            $session = Session::retrieve($sessionId);

            // If payment is complete on Stripe but not in our DB, update it
            if ($session->payment_status === 'paid' && $payment->status === PaymentStatus::PENDING) {
                return $this->handlePaymentSuccess($sessionId, $session->payment_intent);
            }

            // If session expired on Stripe
            if ($session->status === 'expired' && $payment->status === PaymentStatus::PENDING) {
                return $this->handleSessionExpired($sessionId);
            }

        } catch (\Exception $e) {
            // Log error but don't throw - return current payment state
            \Illuminate\Support\Facades\Log::warning("Failed to verify Stripe session: {$e->getMessage()}");
        }

        return $payment;
    }

    /**
     * Build line items for Stripe Checkout.
     */
    private function buildLineItems(FeeQuote $feeQuote): array
    {
        $feeQuote->load('lines');

        return $feeQuote->lines->map(fn($line) => [
            'price_data' => [
                'currency' => strtolower($feeQuote->currency),
                'product_data' => [
                    'name' => $line->label,
                    'metadata' => [
                        'fee_code' => $line->fee_code,
                    ],
                ],
                'unit_amount' => (int) ($line->unit_price),
            ],
            'quantity' => max(1, (int) $line->units),
        ])->toArray();
    }

    /**
     * Generate description for the payment.
     */
    private function generateDescription(FeeQuote $feeQuote): string
    {
        if ($feeQuote->request_id) {
            return "Request fees for Application #{$feeQuote->application_id}";
        }

        return "Application fees for Application #{$feeQuote->application_id}";
    }

    /**
     * Update related entities after successful payment.
     */
    private function updateRelatedEntities(Payment $payment): void
    {
        // Update fee quote status
        if ($payment->fee_quote_id) {
            FeeQuote::where('id', $payment->fee_quote_id)
                ->update(['status' => 'PAID']);
        }

        // Update maintenance schedule if applicable
        $metadata = $payment->metadata ?? [];
        if (isset($metadata['maintenance_schedule_id'])) {
            MaintenanceSchedule::where('id', $metadata['maintenance_schedule_id'])
                ->update([
                    'status' => 'PAID',
                    'paid_at' => now(),
                ]);
        }

        // Auto-approve Renewal requests
        if ($payment->fee_quote_id) {
            $feeQuote = $payment->feeQuote;
            if ($feeQuote && $feeQuote->request && $feeQuote->request->type === \App\Enums\RequestType::RENEWAL) {
                 // Resolve RenewalService lazily to avoid circular dependency if any
                app(\App\Services\Request\RenewalService::class)->approveRenewalAfterPayment($feeQuote->request);
            }
        }
    }
}
