<?php

declare(strict_types=1);

namespace App\Enums;

enum TransferType: string
{
    case CONTRACT = 'CONTRACT';
    case INHERITANCE = 'INHERITANCE';
    case MERGER = 'MERGER';
    case COURT_DECISION = 'COURT_DECISION';

    /**
     * Get a human-readable label for the transfer type.
     */
    public function label(): string
    {
        return match ($this) {
            self::CONTRACT => 'Hợp đồng chuyển nhượng',
            self::INHERITANCE => 'Thừa kế',
            self::MERGER => 'Sáp nhập/Chia tách doanh nghiệp',
            self::COURT_DECISION => 'Quyết định của Tòa án',
        };
    }
}
