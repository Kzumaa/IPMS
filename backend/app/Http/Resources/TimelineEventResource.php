<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimelineEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'type' => $this->resource['type'],
            'category' => $this->resource['category'],
            'title' => $this->resource['title'],
            'description' => $this->resource['description'] ?? null,
            'date' => $this->resource['date'],
            'actor' => $this->resource['actor'] ?? null,
            'data' => $this->resource['data'] ?? null,
            'icon' => $this->resource['icon'] ?? null,
            'color' => $this->resource['color'] ?? 'gray',
        ];
    }
}
