<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'fee_quote_id' => $this->fee_quote_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'method' => $this->method?->value,
            'status' => $this->status?->value,
            'description' => $this->description,
            'paid_at' => $this->paid_at?->toISOString(),
            'receipt_no' => $this->receipt_no,
            'payer_name' => $this->payer_name,
            'stripe_session_id' => $this->stripe_session_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relations
            'fee_quote' => $this->whenLoaded('feeQuote', fn() => [
                'id' => $this->feeQuote->id,
                'version' => $this->feeQuote->version,
                'total_amount' => $this->feeQuote->total_amount,
                'status' => $this->feeQuote->status,
            ]),
        ];
    }
}
