<?php

namespace App\Repositories\Examination;

use App\Models\SubstantiveExamRecord;

interface SubstantiveExamRecordRepositoryInterface
{
    public function create(array $data): SubstantiveExamRecord;
}
