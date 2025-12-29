<?php

declare(strict_types=1);

namespace App\Enums;

enum RequestStatus: string
{
    case DRAFT = 'DRAFT';
    case SUBMITTED = 'SUBMITTED';
    case EXAMINING = 'EXAMINING';
    case APPROVED = 'APPROVED';
    case REFUSED = 'REFUSED';
    case RECORDED = 'RECORDED';

    /**
     * Check if the request can be edited.
     */
    public function canEdit(): bool
    {
        return $this === self::DRAFT;
    }

    /**
     * Check if the request can be submitted.
     */
    public function canSubmit(): bool
    {
        return $this === self::DRAFT;
    }

    /**
     * Check if the request is terminal (final state).
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::APPROVED, self::REFUSED, self::RECORDED], true);
    }

    /**
     * Check if the request is pending (not yet processed).
     */
    public function isPending(): bool
    {
        return in_array($this, [self::DRAFT, self::SUBMITTED, self::EXAMINING], true);
    }
}
