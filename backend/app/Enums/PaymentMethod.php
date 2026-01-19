<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case STRIPE = 'STRIPE';
    case BANK_TRANSFER = 'BANK_TRANSFER';
    case CASH = 'CASH';
    case OTHER = 'OTHER';
}
