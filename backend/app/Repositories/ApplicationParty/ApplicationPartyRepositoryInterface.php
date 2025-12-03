<?php

namespace App\Repositories\ApplicationParty;

use App\Models\ApplicationParty;

interface ApplicationPartyRepositoryInterface
{
    public function create(array $data): ApplicationParty;
}
