<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StripeWebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_type',
        'payload',
        'processing_status',
        'error_message',
        'retry_count',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    /**
     * Mark the webhook as successfully processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'processing_status' => 'PROCESSED',
        ]);
    }

    /**
     * Mark the webhook as failed with an error message.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'processing_status' => 'FAILED',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Increment the retry count.
     */
    public function incrementRetry(): void
    {
        $this->increment('retry_count');
    }

    /**
     * Scope to check if an event has already been processed.
     */
    public function scopeProcessed($query, string $eventId)
    {
        return $query->where('event_id', $eventId)
            ->where('processing_status', 'PROCESSED');
    }
}
