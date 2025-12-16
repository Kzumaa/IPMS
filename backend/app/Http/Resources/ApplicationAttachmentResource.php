<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationAttachmentResource extends JsonResource
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
            'attachment_type' => $this->doc_type, // Map 'doc_type' to 'attachment_type'
            'file_name' => $this->file?->filename,
            'file_path' => $this->file?->url,
            'file_size' => $this->file?->size_bytes,
            'mime_type' => $this->file?->mime,
            'description' => $this->notes,
            'uploaded_at' => $this->file?->uploaded_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => null,
        ];
    }
}
