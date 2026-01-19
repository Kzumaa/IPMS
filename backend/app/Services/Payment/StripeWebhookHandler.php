<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\StripeWebhookLog;
use Illuminate\Support\Facades\Log;
use Stripe\Event;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookHandler
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Verify and parse webhook payload.
     *
     * @throws \Stripe\Exception\SignatureVerificationException
     */
    public function verifyAndParse(string $payload, string $signature): Event
    {
        return Webhook::constructEvent(
            $payload,
            $signature,
            config('services.stripe.webhook_secret')
        );
    }

    /**
     * Handle webhook event.
     */
    public function handle(Event $event): void
    {
        // Check for duplicate (idempotency)
        if ($this->isDuplicate($event->id)) {
            Log::info("Duplicate webhook event ignored: {$event->id}");
            return;
        }

        // Log the event
        $log = $this->logEvent($event);

        try {
            match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutCompleted($event),
                'checkout.session.expired' => $this->handleCheckoutExpired($event),
                'payment_intent.payment_failed' => $this->handlePaymentFailed($event),
                default => Log::info("Unhandled webhook event type: {$event->type}"),
            };

            $log->markAsProcessed();
        } catch (\Throwable $e) {
            $log->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle checkout.session.completed event.
     */
    private function handleCheckoutCompleted(Event $event): void
    {
        /** @var \Stripe\Checkout\Session $session */
        $session = $event->data->object;

        if ($session->payment_status === 'paid') {
            $this->paymentService->handlePaymentSuccess(
                $session->id,
                $session->payment_intent
            );

            Log::info("Payment completed for session: {$session->id}");
        }
    }

    /**
     * Handle checkout.session.expired event.
     */
    private function handleCheckoutExpired(Event $event): void
    {
        /** @var \Stripe\Checkout\Session $session */
        $session = $event->data->object;

        try {
            $this->paymentService->handleSessionExpired($session->id);
            Log::info("Session expired: {$session->id}");
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Payment may not exist yet if session was never initiated
            Log::warning("No payment found for expired session: {$session->id}");
        }
    }

    /**
     * Handle payment_intent.payment_failed event.
     */
    private function handlePaymentFailed(Event $event): void
    {
        /** @var \Stripe\PaymentIntent $paymentIntent */
        $paymentIntent = $event->data->object;

        // Find payment by payment intent if available
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();

        if ($payment) {
            $payment->update(['status' => PaymentStatus::FAILED]);
            Log::info("Payment failed for intent: {$paymentIntent->id}");
        }
    }

    /**
     * Check if an event has already been processed.
     */
    private function isDuplicate(string $eventId): bool
    {
        return StripeWebhookLog::processed($eventId)->exists();
    }

    /**
     * Log the webhook event.
     */
    private function logEvent(Event $event): StripeWebhookLog
    {
        return StripeWebhookLog::create([
            'event_id' => $event->id,
            'event_type' => $event->type,
            'payload' => $event->toArray(),
            'processing_status' => 'PROCESSING',
        ]);
    }
}
