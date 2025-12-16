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
            'priority_date' => null, // TODO: Get from priorityClaims relationship
            'priority_number' => null,
            'priority_country' => null,
            'is_pct' => false, // Not in current schema
            'pct_number' => null,
            'pct_filing_date' => null,
            'pct_publication_date' => null,
            'national_phase_entry_date' => null,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relations
            'parties' => ApplicationPartyResource::collection($this->whenLoaded('parties')),
            'attachments' => ApplicationAttachmentResource::collection($this->whenLoaded('attachments')),
            'protection_titles' => [], // TODO: Implement when ready
            'fee_quotes' => [], // TODO: Implement when ready
        ];
    }
}
