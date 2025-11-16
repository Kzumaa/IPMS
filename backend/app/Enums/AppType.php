<?php


declare(strict_types=1);


namespace App\Enums;


enum AppType: string
{
    case PATENT = 'PATENT';
    case UTILITY = 'UTILITY';
    case INDUSTRIAL_DESIGN = 'INDUSTRIAL_DESIGN';
}
