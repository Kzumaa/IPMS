<?php

namespace App\Repositories\Fee;

use App\Models\FeeQuote;

class ApplicationFeeRepository implements ApplicationFeeRepositoryInterface
{
    public function saveSnapshot(int $applicationId, array $feeItems): array
    {
        // Simple approach: delete old snapshot, insert new
        FeeQuote::where('application_id', $applicationId)->delete();

        $result = [];

        foreach ($feeItems as $item) {
            $result[] = FeeQuote::create([
                'version', 'currency', 'total_amount', 'status', 'generated_at', 'law_version'
                'application_id' => $applicationId,
                'fee_code'       => $item['fee_code'],
                'law_version'    => $item['law_version'],
                'amount'         => $item['amount'],
                'currency'       => $item['currency'],
                'description'    => $item['description'] ?? null,
            ]);
        }

        return $result;
    }
}
