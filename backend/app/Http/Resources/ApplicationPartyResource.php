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
            'address' => $this->snapshot_address,
            'nationality' => $this->nationality_text, // Full text like "Việt Nam"
            'country_code' => $this->nationality, // 2-char code like "VN"
            'email' => $this->snapshot_email ?? $this->user?->email,
            'phone' => $this->phone,
            'id_number' => $this->id_number,
            'id_type' => $this->id_type,
            'is_primary' => $this->is_primary,
            'share_percentage' => null, // Not stored in DB yet
            'user_id' => $this->user_id,
            'created_at' => $this->created_at ? (is_string($this->created_at) ? $this->created_at : $this->created_at->toISOString()) : null,
            'updated_at' => null,
        ];
    }
}
