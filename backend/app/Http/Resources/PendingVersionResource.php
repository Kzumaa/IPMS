<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingVersionResource extends JsonResource
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
            'request_id' => $this->request_id,
            'version_number' => $this->version_number,
            'proposed_data' => $this->proposed_data,
            'changed_fields' => $this->changed_fields,
            'field_changes' => $this->field_changes,
            'changes_count' => $this->getChangesCount(),
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),
            'request' => $this->whenLoaded('request', function () {
                return new ApplicationRequestResource($this->request);
            }),
        ];
    }
}
