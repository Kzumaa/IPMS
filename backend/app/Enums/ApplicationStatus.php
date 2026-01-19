<?php


declare(strict_types=1);


namespace App\Enums;


enum ApplicationStatus: string
{
    case DRAFT = 'DRAFT';
    case SUBMITTED = 'SUBMITTED';
    case FORMALITY_EXAM = 'FORMALITY_EXAM';
    case FORMALITY_PASSED = 'FORMALITY_PASSED';
    case PUBLISHED = 'PUBLISHED';
    case SUB_EXAM_REQ = 'SUB_EXAM_REQ';
    case SUB_EXAM = 'SUB_EXAM';
    case GRANTED = 'GRANTED';
    case DECLINED = 'DECLINED';
    case WITHDRAWN = 'WITHDRAWN';
    case UNDER_AMENDMENT = 'UNDER_AMENDMENT';
    case WAITING_RESPONSE = 'WAITING_RESPONSE';
    case TERMINATED = 'TERMINATED';
    case COMPLAINING = 'COMPLAINING';
    case CHECKING_COMPLAINT = 'CHECKING_COMPLAINT';

    /**
     * Check if this status allows filing a complaint.
     */
    public function canComplain(): bool
    {
        return $this === self::DECLINED;
    }

    /**
     * Check if this is a complaint-related status.
     */
    public function isComplaintStatus(): bool
    {
        return in_array($this, [self::COMPLAINING, self::CHECKING_COMPLAINT]);
    }

    /**
     * Check if this is a terminal (final) status.
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::GRANTED, self::DECLINED, self::WITHDRAWN, self::TERMINATED]);
    }

    /**
     * Get the previous examination stage to revert to after complaint is accepted.
     * Returns null if there's no previous stage to revert to.
     */
    public function getPreviousExamStage(): ?self
    {
        return match ($this) {
            self::DECLINED => self::FORMALITY_EXAM,
            default => null,
        };
    }
}
