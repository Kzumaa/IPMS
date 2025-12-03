<?php

namespace App\Repositories\ApplicationParty;

use App\Models\ApplicationParty;

class ApplicationPartyRepository implements ApplicationPartyRepositoryInterface
{
    public function create(array $data): ApplicationParty
    {
        return ApplicationParty::create($data);
    }
}
