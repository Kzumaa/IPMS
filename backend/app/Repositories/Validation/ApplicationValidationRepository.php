<?php

namespace App\Repositories\Validation;

use Illuminate\Support\Facades\DB;

class ApplicationValidationRepository implements ApplicationValidationRepositoryInterface
{
    public function replaceForApplication(int $applicationId, array $issues): void
    {
        DB::table('validations')
            ->where('application_id', $applicationId)
            ->delete();

        $rows = [];

        foreach ($issues as $issue) {
            $rows[] = [
                'application_id' => $applicationId,
                'rule_code' => $issue['rule_code'],
                'level' => $issue['level'],
                'message' => $issue['message'],
                'context_json' => isset($issue['context'])
                    ? json_encode($issue['context'])
                    : null,
                'created_at' => now(),
                'resolved_at' => null,
            ];
        }

        if (!empty($rows)) {
            DB::table('validations')->insert($rows);
        }
    }

    public function getForApplication(int $applicationId): \Illuminate\Support\Collection
    {
        return DB::table('validations')
            ->where('application_id', $applicationId)
            ->orderBy('created_at')
            ->get();
    }
}
