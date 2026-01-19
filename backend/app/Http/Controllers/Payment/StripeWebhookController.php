<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Services\Payment\StripeWebhookHandler;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __construct(
        private readonly StripeWebhookHandler $webhookHandler
    ) {}

    /**
     * Handle incoming Stripe webhook events.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        if (!$signature) {
            Log::warning('Stripe webhook received without signature');
            return response('Missing signature', 400);
        }

        try {
            $event = $this->webhookHandler->verifyAndParse($payload, $signature);
            $this->webhookHandler->handle($event);

            return response('Webhook handled', 200);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);
            return response('Invalid signature', 400);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Payment not found - might be a test event or duplicate
            Log::warning('Stripe webhook: Payment not found', [
                'error' => $e->getMessage(),
            ]);
            return response('Payment not found', 200); // Return 200 to prevent retries
        } catch (\Throwable $e) {
            Log::error('Stripe webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response('Webhook processing failed', 500);
        }
    }
}
