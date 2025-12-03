<?php

namespace App\Repositories\Decision;

use App\Models\DecisionRecord;

interface DecisionRecordRepositoryInterface
{
    public function create(array $data): DecisionRecord;
}
