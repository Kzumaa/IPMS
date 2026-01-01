<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'PENDING';
    case PROCESSING = 'PROCESSING';
    case COMPLETED = 'COMPLETED';
    case FAILED = 'FAILED';
    case CANCELLED = 'CANCELLED';
    case REFUNDED = 'REFUNDED';
    case PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED';
    case EXPIRED = 'EXPIRED';

    /**
     * Check if the payment status is terminal (no more transitions expected).
     */
    public function isTerminal(): bool
    {
        return in_array($this, [
            self::COMPLETED,
            self::FAILED,
            self::CANCELLED,
            self::REFUNDED,
            self::EXPIRED,
        ], true);
    }

    /**
     * Check if the payment has been successfully paid.
     */
    public function isPaid(): bool
    {
        return $this === self::COMPLETED;
    }

    /**
     * Check if the payment can be refunded.
     */
    public function canRefund(): bool
    {
        return in_array($this, [
            self::COMPLETED,
            self::PARTIALLY_REFUNDED,
        ], true);
    }
}
