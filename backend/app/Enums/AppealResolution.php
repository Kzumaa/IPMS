<?php

declare(strict_types=1);

namespace App\Enums;

enum AppealResolution: string
{
    case UPHELD = 'UPHELD';
    case OVERTURNED = 'OVERTURNED';
    case PARTIAL = 'PARTIAL';
    case WITHDRAWN = 'WITHDRAWN';

    /**
     * Get a human-readable label for the resolution.
     */
    public function label(): string
    {
        return match ($this) {
            self::UPHELD => 'Giữ nguyên quyết định',
            self::OVERTURNED => 'Hủy bỏ quyết định',
            self::PARTIAL => 'Sửa đổi một phần',
            self::WITHDRAWN => 'Rút khiếu nại',
        };
    }
}
