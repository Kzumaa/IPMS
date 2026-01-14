<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get first priority claim for priority fields (only if relation is loaded)
        $priorityClaim = $this->relationLoaded('priorityClaims') ? $this->priorityClaims->first() : null;

        return [
            'id' => $this->id,
            'filing_number' => $this->app_no, // Map 'app_no' to 'filing_number'
            'app_type' => $this->app_type,
            'title' => $this->title,
            'abstract' => null, // Stored as attachment (doc_type: ABSTRACT)
            'description' => null, // Stored as attachment (doc_type: DESCRIPTION)
            'claims' => null, // Stored as attachment (doc_type: CLAIMS)
            'status' => $this->status,
            'filing_date' => $this->filing_date?->toDateString(),
            'priority_date' => $priorityClaim?->priority_date?->toDateString(),
            'priority_number' => $priorityClaim?->priority_number,
            'priority_country' => $priorityClaim?->country_code,
            'is_pct' => $this->is_pct ?? false,
            'pct_number' => $this->pct_number,
            'pct_filing_date' => $this->pct_filing_date?->toDateString(),
            'pct_publication_date' => $this->pct_publication_date?->toDateString(),
            'national_phase_entry_date' => $this->national_phase_entry_date?->toDateString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relations
            'parties' => ApplicationPartyResource::collection($this->whenLoaded('parties')),
            'attachments' => ApplicationAttachmentResource::collection($this->whenLoaded('attachments')),
            'metrics' => $this->whenLoaded('metrics', fn() => $this->metrics ? [
                'description_pages' => $this->metrics->description_pages,
                'abstract_pages' => $this->metrics->abstract_pages,
                'claims_independent' => $this->metrics->claims_independent,
                'claims_total' => $this->metrics->claims_total,
                'drawings_images' => $this->metrics->drawings_images,
                'ipc_groups' => $this->metrics->ipc_groups,
                'id_variants' => $this->metrics->id_variants,
                'id_images_per_variant' => $this->metrics->id_images_per_variant,
                'has_priority' => $this->metrics->has_priority,
                'priority_count' => $this->metrics->priority_count,
                'is_user_classified' => $this->metrics->is_user_classified,
            ] : null),
            'protection_title' => $this->whenLoaded('protectionTitle', fn() => $this->protectionTitle ? [
                'id' => $this->protectionTitle->id,
                'registration_number' => $this->protectionTitle->registration_number,
                'issue_date' => $this->protectionTitle->issue_date?->toDateString(),
                'expiry_date' => $this->protectionTitle->expiry_date?->toDateString(),
                'status' => $this->protectionTitle->status,
            ] : null),
            'requests' => $this->whenLoaded('requests', fn() => $this->requests->map(fn($req) => [
                'id' => $req->id,
                'type' => $req->type,
                'status' => $req->status,
                'license' => $req->license ? [
                    'license_type' => $req->license->license_type,
                    'valid_from' => $req->license->valid_from?->toDateString(),
                    'valid_to' => $req->license->valid_to?->toDateString(),
                    'scope_territory' => $req->license->scope_territory,
                    'licensor' => $req->license->licensor ? [
                        'id' => $req->license->licensor->id,
                        'name' => $req->license->licensor->full_name,
                        'email' => $req->license->licensor->email,
                    ] : null,
                ] : null,
            ])),
            'fee_quotes' => $this->whenLoaded('feeQuotes', fn() => $this->feeQuotes->map(fn($quote) => [
                'id' => $quote->id,
                'version' => $quote->version,
                'currency' => $quote->currency,
                'total_amount' => $quote->total_amount,
                'status' => $quote->status,
                'generated_at' => $quote->generated_at?->toISOString(),
            ])),
        ];
    }
}
