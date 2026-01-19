<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationVersionResource extends JsonResource
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
            'version_number' => $this->version_number,
            'amendment_request_id' => $this->amendment_request_id,
            'change_summary' => $this->change_summary,
            'snapshot_data' => $this->snapshot_data,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->full_name,
                'email' => $this->creator->email,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'is_initial' => $this->isInitialVersion(),
        ];
    }
}
