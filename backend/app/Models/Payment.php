<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'fee_quote_id',
        'amount',
        'currency',
        'method',
        'status',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'paid_at',
        'receipt_no',
        'payer_name',
        'receipt_file_id',
        'description',
        'metadata',
        'expires_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
        'amount' => 'decimal:2',
        'status' => PaymentStatus::class,
        'method' => PaymentMethod::class,
        'metadata' => 'array',
    ];

    /**
     * Get the application that this payment belongs to.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Get the fee quote that this payment is for.
     */
    public function feeQuote(): BelongsTo
    {
        return $this->belongsTo(FeeQuote::class);
    }

    /**
     * Get the receipt file attached to this payment.
     */
    public function receiptFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'receipt_file_id');
    }

    /**
     * Check if the payment has been completed successfully.
     */
    public function isPaid(): bool
    {
        return $this->status?->isPaid() ?? false;
    }

    /**
     * Check if the payment can be refunded.
     */
    public function canRefund(): bool
    {
        return $this->status?->canRefund() ?? false;
    }

    /**
     * Check if the payment session has expired.
     */
    public function isExpired(): bool
    {
        if ($this->expires_at === null) {
            return false;
        }

        return $this->expires_at->isPast() && $this->status === PaymentStatus::PENDING;
    }

    /**
     * Mark the payment as completed.
     */
    public function markAsCompleted(string $paymentIntentId): void
    {
        $this->update([
            'status' => PaymentStatus::COMPLETED,
            'stripe_payment_intent_id' => $paymentIntentId,
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark the payment as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => PaymentStatus::FAILED,
        ]);
    }

    /**
     * Mark the payment as expired.
     */
    public function markAsExpired(): void
    {
        $this->update([
            'status' => PaymentStatus::EXPIRED,
        ]);
    }

    /**
     * Scope to get pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', PaymentStatus::PENDING);
    }

    /**
     * Scope to get completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', PaymentStatus::COMPLETED);
    }

    /**
     * Scope to get payments by Stripe session ID.
     */
    public function scopeByStripeSession($query, string $sessionId)
    {
        return $query->where('stripe_session_id', $sessionId);
    }
}
