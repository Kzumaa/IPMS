<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationPartyResource extends JsonResource
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
            'party_type' => $this->role, // Map 'role' to 'party_type'
            'name' => $this->snapshot_name ?? $this->user?->name,
            'name_en' => null,
            'address' => $this->snapshot_address,
            'address_en' => null,
            'nationality' => $this->nationality,
            'country_code' => null,
            'email' => $this->snapshot_email ?? $this->user?->email,
            'phone' => null,
            'id_number' => null,
            'id_type' => null,
            'is_primary' => $this->is_primary,
            'share_percentage' => null,
            'created_at' => $this->created_at ? (is_string($this->created_at) ? $this->created_at : $this->created_at->toISOString()) : null,
            'updated_at' => null,
        ];
    }
}
