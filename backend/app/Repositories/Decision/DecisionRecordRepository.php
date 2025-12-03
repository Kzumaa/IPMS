<?php

namespace App\Repositories\Decision;

use App\Models\DecisionRecord;

class DecisionRecordRepository implements DecisionRecordRepositoryInterface
{
    public function create(array $data): DecisionRecord
    {
        return DecisionRecord::create($data);
    }
}
