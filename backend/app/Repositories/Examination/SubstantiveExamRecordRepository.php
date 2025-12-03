<?php

namespace App\Repositories\Examination;

use App\Models\SubstantiveExamRecord;

class SubstantiveExamRecordRepository implements SubstantiveExamRecordRepositoryInterface
{
    public function create(array $data): SubstantiveExamRecord
    {
        return SubstantiveExamRecord::create($data);
    }
}
