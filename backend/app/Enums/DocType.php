<?php

declare(strict_types=1);

namespace App\Enums;

enum DocType: string
{
    // Core application documents (Patent/Utility)
    case DESCRIPTION = 'DESCRIPTION';
    case CLAIMS = 'CLAIMS';
    case ABSTRACT = 'ABSTRACT';
    case DRAWINGS = 'DRAWINGS';

    // Industrial Design specific
    case ID_DESCRIPTION = 'ID_DESCRIPTION';
    case ID_PHOTOS_SET = 'ID_PHOTOS_SET';

    // Priority claim support
    case PRIORITY_DOC = 'PRIORITY_DOC';

    // Support documents
    case TRANSLATION = 'TRANSLATION';
    case OTHER = 'OTHER';

    // Official/Admin documents (staff only)
    case OFFICIAL_NOTICE = 'OFFICIAL_NOTICE';
    case GAZETTE = 'GAZETTE';
    case DECISION = 'DECISION';
    case CERTIFICATE = 'CERTIFICATE';
}
