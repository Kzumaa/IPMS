<?php

namespace App\Repositories\Examination;

use App\Models\FormalityExamRecord;

interface FormalityExamRecordRepositoryInterface
{
    public function create(array $data): FormalityExamRecord;
}
