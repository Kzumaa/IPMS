<?php

namespace App\Repositories\Validation;

use Illuminate\Support\Collection;

interface ApplicationValidationRepositoryInterface
{
    /**
     * Replace all validation issues for this application.
     *
     * @param array<int,array{rule_code:string,level:string,message:string,context:?array}> $issues
     */
    public function replaceForApplication(int $applicationId, array $issues): void;

    public function getForApplication(int $applicationId): Collection;
}
