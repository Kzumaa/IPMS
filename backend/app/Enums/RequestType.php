<?php

declare(strict_types=1);

namespace App\Enums;

enum RequestType: string
{
    case AMENDMENT = 'AMENDMENT';
    case ASSIGNMENT = 'ASSIGNMENT';
    case LICENSE = 'LICENSE';
    case SPLIT = 'SPLIT';
    case CONVERSION = 'CONVERSION';
    case COMPLAINT = 'COMPLAINT';
    case RENEWAL = 'RENEWAL';
    case TERMINATION = 'TERMINATION';
    case WITHDRAWAL = 'WITHDRAWAL'; // Pre-grant application withdrawal

    /**
     * Get the fee code prefix for this request type.
     */
    public function getFeeCodeSuffix(): string
    {
        return match ($this) {
            self::AMENDMENT => 'REQ-AMEND',
            self::ASSIGNMENT => 'REQ-ASSIGN',
            self::LICENSE => 'REQ-LICENSE',
            self::SPLIT => 'REQ-SPLIT',
            self::CONVERSION => 'REQ-CONVERT',
            self::COMPLAINT => 'REQ-COMPLAINT',
            self::RENEWAL => 'REQ-RENEWAL',
            self::TERMINATION => 'REQ-TERMINATE',
            self::WITHDRAWAL => 'REQ-WITHDRAW',
        };
    }

    /**
     * Check if this request type is for pre-grant applications.
     */
    public function isPreGrant(): bool
    {
        return in_array($this, [
            self::AMENDMENT,
            self::SPLIT,
            self::WITHDRAWAL,
        ]);
    }

    /**
     * Check if this request type is for post-grant applications.
     */
    public function isPostGrant(): bool
    {
        return in_array($this, [
            self::LICENSE,
            self::ASSIGNMENT,
            self::RENEWAL,
            self::TERMINATION,
        ]);
    }
}
