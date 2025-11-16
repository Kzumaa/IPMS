<?php


declare(strict_types=1);


namespace App\Enums;


enum StaffRole: string
{
    case AUTH_ADMIN = 'AUTH_ADMIN';
    case AUTH_MANAGER = 'AUTH_MANAGER';
    case FORMALITY_OFFICER = 'FORMALITY_OFFICER';
    case EXAMINER = 'EXAMINER';
    case CASHIER = 'CASHIER';
    case CLERK = 'CLERK';
}
