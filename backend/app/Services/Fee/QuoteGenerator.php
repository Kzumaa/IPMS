<?php

namespace App\Services\Fee;

use App\Models\Application;
use App\Models\FeeQuote;
use App\Models\FeeQuoteLine;
use App\Models\FeeRule;

class QuoteGenerator
{
    /**
     * Very simple and safe evaluator for expressions like "max(0, claims_independent-1)".
     * Allowed tokens: numbers, + - * / ( ), identifiers from metrics, functions: max,min,ceil,floor.
     */
    public function generate(Application $application, string $lawVersion, string $currency = 'VND'): FeeQuote
    {
        // 1. Fetch all fee rules for this law version
        $rules = FeeRule::where('law_version', $lawVersion)
            ->get();

        $catalogs = \App\Models\FeeCatalog::where('law_version', $lawVersion)->get()->keyBy('code');

        // 2. Create a new FeeQuote
        $quote = FeeQuote::create([
            'application_id' => $application->id,
            'version' => FeeQuote::where('application_id', $application->id)->max('version') + 1,
            'currency' => $currency,
            'status' => 'DRAFT',
            'law_version' => $lawVersion,
        ]);

        $totalAmount = 0;

        // 3. Iterate over rules and calculate fees
        foreach ($rules as $rule) {
            $catalog = $catalogs[$rule->fee_code] ?? null;
            if (!$catalog) {
                continue;
            }

            // Filter by app_type
            if ($catalog->app_type !== $application->app_type->value) {
                continue;
            }

            $units = $this->evalUnits($rule->expression, $application->metrics);

            if ($units > 0) {
                $amount = $units * $catalog->unit_price;
                $totalAmount += $amount;

                FeeQuoteLine::create([
                    'fee_quote_id' => $quote->id,
                    'fee_code' => $rule->fee_code,
                    'label' => $catalog->label,
                    'units' => $units,
                    'unit_price' => $catalog->unit_price,
                    'amount' => $amount,
                    'source' => 'AUTO',
                ]);
            }
        }

        // 4. Update total amount
        $quote->update(['total_amount' => $totalAmount]);

        return $quote;
    }

    /**
     * Very simple and safe evaluator for expressions like "max(0, claims_independent-1)".
     * Allowed tokens: numbers, + - * / ( ), identifiers from metrics, functions: max,min,ceil,floor.
     */
    private function evalUnits(string $expr, $metrics): float
    {
        $allowed = ['max', 'min', 'ceil', 'floor'];
        $vars = [
            'description_pages' => (int)($metrics->description_pages ?? 0),
            'claims_independent' => (int)($metrics->claims_independent ?? 0),
            'claims_total' => (int)($metrics->claims_total ?? 0),
            'drawings_images' => (int)($metrics->drawings_images ?? 0),
            'ipc_groups' => (int)($metrics->ipc_groups ?? 0),
            'id_variants' => (int)($metrics->id_variants ?? 0),
            'id_images_per_variant' => (int)($metrics->id_images_per_variant ?? 0),
            'priority_count' => (int)($metrics->priority_count ?? 0),
            'is_user_classified' => (int)($metrics->is_user_classified ?? 0),
        ];
        $safe = preg_replace('/\s+/', '', $expr);
// Replace identifiers with values
        foreach ($vars as $k => $v) {
            $safe = preg_replace('/\b' . preg_quote($k, '/') . '\b/', (string)$v, $safe);
        }
// Whitelist characters
        if (preg_match('/[^0-9\+\-\*\/\(\)\.,a-z\?\:]/i', $safe)) {
            return 0.0;
        }
// Replace allowed functions namespace
        foreach ($allowed as $fn) {
            $safe = preg_replace('/\b' . $fn . '\b/', '\\' . $fn, $safe);
        }
// Evaluate
        try {
            /** @var float $val */
            $val = eval('return ' . $safe . ';');
            return max(0.0, $val);
        } catch (\Throwable $e) {
            return 0.0;
        }
    }
}
