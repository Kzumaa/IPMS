<?php

declare(strict_types=1);

namespace App\Enums;

enum AmendmentSection: string
{
    case BIBLIOGRAPHY = 'BIBLIOGRAPHY';
    case SPECIFICATION = 'SPECIFICATION';
    case CLAIMS = 'CLAIMS';
    case DRAWINGS = 'DRAWINGS';
    case REPRESENTATIVE = 'REPRESENTATIVE';

    /**
     * Get a human-readable label for the section.
     */
    public function label(): string
    {
        return match ($this) {
            self::BIBLIOGRAPHY => 'Thông tin thư mục',
            self::SPECIFICATION => 'Bản mô tả',
            self::CLAIMS => 'Yêu cầu bảo hộ',
            self::DRAWINGS => 'Bản vẽ/Hình ảnh',
            self::REPRESENTATIVE => 'Người đại diện',
        };
    }
}
