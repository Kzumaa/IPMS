<?php

declare(strict_types=1);

namespace App\Enums;

enum LicenseType: string
{
    case EXCLUSIVE = 'EXCLUSIVE';
    case NON_EXCLUSIVE = 'NON_EXCLUSIVE';
    case COMPULSORY = 'COMPULSORY';

    /**
     * Get a human-readable label for the license type.
     */
    public function label(): string
    {
        return match ($this) {
            self::EXCLUSIVE => 'Độc quyền',
            self::NON_EXCLUSIVE => 'Không độc quyền',
            self::COMPULSORY => 'Bắt buộc',
        };
    }
}
