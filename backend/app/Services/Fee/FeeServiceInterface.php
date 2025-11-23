<?php

namespace App\Services\Fee;

use App\Models\Application;

interface FeeServiceInterface
{
    /**
     * @return array<array{fee_code:string,law_version:string,amount:int,currency:string,description:?string}>
     */
    public function calculateForApplication(Application $application, array $metrics): array;
}
