<?php

namespace App\Repositories\Examination;

use App\Models\FormalityExamRecord;

class FormalityExamRecordRepository implements FormalityExamRecordRepositoryInterface
{
    public function create(array $data): FormalityExamRecord
    {
        return FormalityExamRecord::create($data);
    }
}
