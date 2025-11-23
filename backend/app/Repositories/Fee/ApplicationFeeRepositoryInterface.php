<?php

namespace App\Repositories\Fee;

use App\Models\FeeQuote;

interface ApplicationFeeRepositoryInterface
{
    /**
     * @param array<int,array{fee_code:string,law_version:string,amount:int,currency:string,description:?string}> $feeItems
     * @return FeeQuote[]
     */
    public function saveSnapshot(int $applicationId, array $feeItems): array;
}
