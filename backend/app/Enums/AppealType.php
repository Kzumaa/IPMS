<?php

declare(strict_types=1);

namespace App\Enums;

enum AppealType: string
{
    case DECISION_APPEAL = 'DECISION_APPEAL';
    case NOTICE_OBJECTION = 'NOTICE_OBJECTION';

    /**
     * Get a human-readable label for the appeal type.
     */
    public function label(): string
    {
        return match ($this) {
            self::DECISION_APPEAL => 'Khiếu nại quyết định',
            self::NOTICE_OBJECTION => 'Phản đối thông báo',
        };
    }
}
