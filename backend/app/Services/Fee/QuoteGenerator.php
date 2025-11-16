<?php

namespace App\Services\Fee;

class QuoteGenerator
{
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
        ];
        $safe = preg_replace('/\s+/', '', $expr);
// Replace identifiers with values
        foreach ($vars as $k => $v) {
            $safe = preg_replace('/\b' . preg_quote($k, '/') . '\b/', (string)$v, $safe);
        }
// Whitelist characters
        if (preg_match('/[^0-9\+\-\*\/\(\)\.,a-z]/i', $safe)) {
            return 1.0;
        }
// Replace allowed functions namespace
        foreach ($allowed as $fn) {
            $safe = preg_replace('/\b' . $fn . '\b/', '\\' . $fn, $safe);
        }
// Evaluate
        try {
            /** @var float $val */
            $val = eval('return (float)(' . $safe . ');');
            return max(0.0, $val);
        } catch (\Throwable $e) {
            return 1.0;
        }
    }
}
