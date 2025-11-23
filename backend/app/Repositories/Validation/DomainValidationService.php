<?php

namespace App\Repositories\Validation;

class DomainValidationService implements DomainValidationServiceInterface
{
    public function validateForDraft(array $applicationData, array $metrics): array
    {
        $issues = [];

        $ipType = $applicationData['ip_type'] ?? null;

        // Example: patent must have at least 1 claim
        if ($ipType === 'PATENT' && ($metrics['claims_total'] ?? 0) < 1) {
            $issues[] = [
                'rule_code' => 'PATENT_CLAIMS_MIN',
                'level'     => 'ERROR',
                'message'   => 'Đơn sáng chế phải có ít nhất 01 điểm yêu cầu bảo hộ.',
                'context'   => [
                    'claims_total' => $metrics['claims_total'] ?? 0,
                ],
            ];
        }

        // Example: description pages cannot be zero if there are claims
        if (($metrics['claims_total'] ?? 0) > 0 && ($metrics['description_pages'] ?? 0) <= 0) {
            $issues[] = [
                'rule_code' => 'DESC_PAGES_MIN',
                'level'     => 'WARN',
                'message'   => 'Số trang mô tả đang là 0. Vui lòng kiểm tra lại dữ liệu.',
                'context'   => [
                    'description_pages' => $metrics['description_pages'] ?? 0,
                ],
            ];
        }

        // Add more rules: priority claims, drawings, Locarno/IPC consistency, etc.

        return $issues;
    }
}
