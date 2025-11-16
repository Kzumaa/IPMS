<?php


declare(strict_types=1);


namespace App\Enums;


enum ApplicationStatus: string
{
    case DRAFT = 'DRAFT';
    case SUBMITTED = 'SUBMITTED';
    case FORMALITY_EXAM = 'FORMALITY_EXAM';
    case PUBLISHED = 'PUBLISHED';
    case SUB_EXAM_REQ = 'SUB_EXAM_REQ';
    case SUB_EXAM = 'SUB_EXAM';
    case GRANTED = 'GRANTED';
    case REFUSED = 'REFUSED';
    case WITHDRAWN = 'WITHDRAWN';
}
