<?php

namespace App\Http\Resources;

use App\Enums\ApplicationStatus;
use App\Enums\AppType;
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

        // Calculate Issue Date (Grant Date)
        // Logic: Use latest SubstantiveExamRecord with result ACCEPTABLE, fallback to updated_at if GRANTED
        $issueDate = null;
        if ($this->status === ApplicationStatus::GRANTED) {
            if ($this->relationLoaded('substantiveExamRecords')) {
                $examRecord = $this->substantiveExamRecords
                    ->where('result', 'ACCEPTABLE')
                    ->sortByDesc('exam_date')
                    ->first();
                $issueDate = $examRecord?->exam_date?->toDateString();
            }
            
            if (!$issueDate) {
                $issueDate = $this->updated_at?->toDateString();
            }
        }

        // Expiry Date is now stored directly on the Application model
        $expiryDate = $this->expiry_date?->toDateString();

        return [
            'id' => $this->id,
            'created_by' => $this->created_by,
            'filing_number' => $this->app_no, // Map 'app_no' to 'filing_number'
            'registration_number' => $this->app_no, // Fallback since ProtectionTitle is unused
            'app_type' => $this->app_type,
            'title' => $this->title,
            'abstract' => null, // Stored as attachment (doc_type: ABSTRACT)
            'description' => null, // Stored as attachment (doc_type: DESCRIPTION)
            'claims' => null, // Stored as attachment (doc_type: CLAIMS)
            'status' => $this->when(true, function () {
                // Virtual Status: If any unpaid fee exists, show WAITING_FOR_PAYMENT
                if ($this->relationLoaded('feeQuotes')) {
                    $hasUnpaidFee = $this->feeQuotes
                        ->whereIn('status', ['DRAFT', 'PENDING', 'FINAL'])
                        ->isNotEmpty();
                    
                    if ($hasUnpaidFee) {
                        return 'WAITING_FOR_PAYMENT';
                    }
                }
                return $this->status;
            }),
            'filing_date' => $this->filing_date?->toDateString(),
            'issue_date' => $issueDate,
            'expiry_date' => $expiryDate,
            'priority_date' => $priorityClaim?->filing_date?->toDateString(),
            'priority_number' => $priorityClaim?->number,
            'priority_country' => $priorityClaim?->country_code,
            'is_pct' => $this->relationLoaded('pctInfo') ? ($this->pctInfo !== null) : false,
            'pct_number' => $this->relationLoaded('pctInfo') ? $this->pctInfo?->pct_app_no : null,
            'pct_filing_date' => $this->relationLoaded('pctInfo') ? $this->pctInfo?->pct_filing_date?->toDateString() : null,
            'pct_publication_date' => $this->relationLoaded('pctInfo') ? $this->pctInfo?->pct_pub_date?->toDateString() : null,
            'national_phase_entry_date' => $this->national_phase_entry_date?->toDateString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relations
            'parties' => ApplicationPartyResource::collection($this->whenLoaded('parties')),
            'priority_claims' => $this->whenLoaded('priorityClaims', fn() => $this->priorityClaims->map(fn($claim) => [
                'id' => $claim->id,
                'kind' => $claim->kind,
                'number' => $claim->number,
                'filing_date' => $claim->filing_date?->toDateString(),
                'country_code' => $claim->country_code,
                'agreement_name' => $claim->agreement_name,
            ])),
            'sntc_info' => $this->whenLoaded('sntcInfo', fn() => $this->sntcInfo ? [
                'agency_name' => $this->sntcInfo->agency_name,
                'project_name' => $this->sntcInfo->project_name,
                'project_code' => $this->sntcInfo->project_code,
            ] : null),
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
            'ipc_classes' => $this->whenLoaded('ipcClasses', fn() => $this->ipcClasses->map(fn($c) => [
                'id' => $c->id,
                'ipc_code' => $c->ipc_code,
                'version' => $c->version,
                'assigned_by_type' => $c->assigned_by_type,
            ])),
            'locarno_classes' => $this->whenLoaded('locarnoClasses', fn() => $this->locarnoClasses->map(fn($c) => [
                'id' => $c->id,
                'class_no' => $c->class_no,
                'subclass_no' => $c->subclass_no,
                'field_of_use' => $c->field_of_use,
                'assigned_by_type' => $c->assigned_by_type,
            ])),
        ];
    }
}
