<?php

namespace App\Repositories\Validation;

interface DomainValidationServiceInterface
{
    /**
     * @return array<int,array{rule_code:string,level:string,message:string,context:?array}>
     */
    public function validateForDraft(array $applicationData, array $metrics): array;
}
