<?php

declare(strict_types=1);

namespace App\Enums;

enum ComplaintResolution: string
{
    case ACCEPTED = 'ACCEPTED';
    case REJECTED = 'REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::ACCEPTED => 'Accepted - Reverted to previous stage',
            self::REJECTED => 'Rejected - Decision upheld',
        };
    }
}
