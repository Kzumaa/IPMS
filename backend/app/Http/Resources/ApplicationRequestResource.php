<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationRequestResource extends JsonResource
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
            'type' => $this->type->value,
            'status' => $this->status->value,
            'request_date' => $this->request_date?->format('Y-m-d'),
            'processed_date' => $this->processed_date?->format('Y-m-d'),
            'processing_notes' => $this->processing_notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // Creator
            'creator' => $this->whenLoaded('creator', fn() => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ]),

            // Processor (staff)
            'processor' => $this->whenLoaded('processor', fn() => [
                'id' => $this->processor->id,
                'name' => $this->processor->name,
            ]),

            // Type-specific details
            'amendment' => $this->whenLoaded('amendment', fn() => [
                'section' => $this->amendment->section, // Now an array of section strings
                'change_summary' => $this->amendment->change_summary,
                'field_name' => $this->amendment->field_name,
                'old_value' => $this->amendment->old_value,
                'new_value' => $this->amendment->new_value,
                'pending_version_id' => $this->amendment->pending_version_id,
                'pending_version' => $this->whenLoaded('amendment.pendingVersion', fn() => [
                    'id' => $this->amendment->pendingVersion->id,
                    'version_number' => $this->amendment->pendingVersion->version_number,
                    'changed_fields' => $this->amendment->pendingVersion->changed_fields,
                    'field_changes' => $this->amendment->pendingVersion->field_changes,
                    'created_at' => $this->amendment->pendingVersion->created_at?->toIso8601String(),
                ]),
            ]),

            'assignment' => $this->whenLoaded('assignment', fn() => [
                'transfer_type' => $this->assignment->transfer_type->value,
                'transfer_type_label' => $this->assignment->transfer_type->label(),
                'contract_number' => $this->assignment->contract_number,
                'contract_date' => $this->assignment->contract_date?->format('Y-m-d'),
                'assignor' => $this->whenLoaded('assignment.assignor', fn() => [
                    'id' => $this->assignment->assignor->id,
                    'name' => $this->assignment->assignor->name,
                    'email' => $this->assignment->assignor->email,
                ]),
                'assignee' => $this->whenLoaded('assignment.assignee', fn() => [
                    'id' => $this->assignment->assignee->id,
                    'name' => $this->assignment->assignee->name,
                    'email' => $this->assignment->assignee->email,
                ]),
            ]),

            'license' => $this->whenLoaded('license', fn() => [
                'license_type' => $this->license->license_type->value,
                'license_type_label' => $this->license->license_type->label(),
                'scope_territory' => $this->license->scope_territory,
                'scope_products' => $this->license->scope_products,
                'valid_from' => $this->license->valid_from?->format('Y-m-d'),
                'valid_to' => $this->license->valid_to?->format('Y-m-d'),
                'contract_number' => $this->license->contract_number,
                'licensor' => $this->license->relationLoaded('licensor') && $this->license->licensor
                    ? [
                        'id' => $this->license->licensor->id,
                        'name' => $this->license->licensor->name,
                        'email' => $this->license->licensor->email,
                    ]
                    : null,
                'licensees' => $this->license->relationLoaded('licensees')
                    ? $this->license->licensees->map(fn($licenseeRecord) => [
                        'id' => $licenseeRecord->licensee->id,
                        'name' => $licenseeRecord->licensee->name,
                        'email' => $licenseeRecord->licensee->email,
                    ])
                    : null,
            ]),

            'complaint' => $this->whenLoaded('complaint', fn() => [
                'grounds' => $this->complaint->grounds,
                'deadline' => $this->complaint->deadline?->format('Y-m-d'),
                'complaint_number' => $this->complaint->complaint_number,
                'is_resolved' => $this->complaint->isResolved(),
                'is_deadline_passed' => $this->complaint->isDeadlinePassed(),
                'resolved_at' => $this->complaint->resolved_at?->format('Y-m-d'),
                'resolution' => $this->complaint->resolution?->value,
            ]),

            // Fee quote
            'fee_quote' => $this->whenLoaded('feeQuote', fn() => [
                'id' => $this->feeQuote->id,
                'version' => $this->feeQuote->version,
                'currency' => $this->feeQuote->currency,
                'total_amount' => $this->feeQuote->total_amount,
                'status' => $this->feeQuote->status,
                'lines' => $this->whenLoaded('feeQuote.lines', fn() =>
                    $this->feeQuote->lines->map(fn($line) => [
                        'fee_code' => $line->fee_code,
                        'label' => $line->label,
                        'units' => $line->units,
                        'unit_price' => $line->unit_price,
                        'amount' => $line->amount,
                    ])
                ),
            ]),

            // Attachments
            'attachments' => $this->whenLoaded('attachments', fn() =>
                $this->attachments->map(fn($att) => [
                    'id' => $att->id,
                    'doc_type' => $att->doc_type,
                    'is_current' => $att->is_current,
                    'notes' => $att->notes,
                    'created_at' => $att->created_at?->toIso8601String(),
                    'file' => $att->relationLoaded('file') && $att->file ? [
                        'id' => $att->file->id,
                        'filename' => $att->file->filename,
                        'mime' => $att->file->mime,
                        'size_bytes' => $att->file->size_bytes,
                    ] : null,
                ])
            ),

            // Computed properties
            'can_edit' => $this->canEdit(),
            'can_submit' => $this->canSubmit(),
            'is_pending' => $this->isPending(),
            'is_terminal' => $this->isTerminal(),
        ];
    }
}
