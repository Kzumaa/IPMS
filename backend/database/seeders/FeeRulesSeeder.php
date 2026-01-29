<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $law = 'TT263-2016';
        $rows = [
// ---- PATENT ----
            ['fee_code' => 'PAT-FILING', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'PAT-EXAM-FORMALITY-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => '20% của mức thu 900k', 'law_version' => $law],
            ['fee_code' => 'PAT-EXAM-FORMALITY-SURCHARGE', 'expression' => 'max(0, claims_independent-1)', 'metric_keys' => 'claims_independent', 'notes' => 'Phí thẩm định hình thức cho mỗi điểm độc lập > 1', 'law_version' => $law],
            ['fee_code' => 'PAT-EXAM-SUBSTANTIVE-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => '80% của mức thu 900k', 'law_version' => $law],
            ['fee_code' => 'PAT-EXAM-SUBSTANTIVE-SURCHARGE', 'expression' => 'max(0, claims_independent-1)', 'metric_keys' => 'claims_independent', 'notes' => 'Phí thẩm định nội dung cho mỗi điểm độc lập > 1', 'law_version' => $law],
            ['fee_code' => 'PAT-EXAM-PAGE-SURCHARGE', 'expression' => 'max(0, description_pages-6)', 'metric_keys' => 'description_pages', 'notes' => 'Trang từ 7 trở đi', 'law_version' => $law],
            ['fee_code' => 'PAT-CLASSIFICATION-IPC', 'expression' => 'is_user_classified ? 0 : 1', 'metric_keys' => 'is_user_classified', 'notes' => 'Miễn phí nếu người nộp đơn tự phân loại, tính 1 nhóm nếu không', 'law_version' => $law],
            ['fee_code' => 'PAT-PRIORITY-EXAM', 'expression' => 'priority_count', 'metric_keys' => 'priority_count', 'notes' => 'Mỗi yêu cầu', 'law_version' => $law],
            ['fee_code' => 'PAT-GRANT-CERT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'PAT-GRANT-CERT-ADD-INDEP', 'expression' => 'max(0, claims_independent-1)', 'metric_keys' => 'claims_independent', 'notes' => 'Điểm độc lập bắt đầu từ điểm thứ 2', 'law_version' => $law],
            ['fee_code' => 'PAT-PUBLICATION-GRANT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => 'Hình đầu tiên', 'law_version' => $law],
            ['fee_code' => 'PAT-PUBLICATION-GRANT-ADDL-IMAGE', 'expression' => 'max(0, drawings_images-1)', 'metric_keys' => 'drawings_images', 'notes' => 'Từ hình thứ 2 trở đi', 'law_version' => $law],


// ---- UTILITY ----
            ['fee_code' => 'UTL-FILING', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-EXAM-FORMALITY-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-EXAM-SUBSTANTIVE-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-EXAM-PAGE-SURCHARGE', 'expression' => 'max(0, description_pages-6)', 'metric_keys' => 'description_pages', 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-CLASSIFICATION-IPC', 'expression' => 'is_user_classified ? 0 : 1', 'metric_keys' => 'is_user_classified', 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-PRIORITY-EXAM', 'expression' => 'priority_count', 'metric_keys' => 'priority_count', 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-GRANT-CERT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-GRANT-CERT-ADD-INDEP', 'expression' => 'max(0, claims_independent-1)', 'metric_keys' => 'claims_independent', 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-PUBLICATION-GRANT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'UTL-PUBLICATION-GRANT-ADDL-IMAGE', 'expression' => 'max(0, drawings_images-1)', 'metric_keys' => 'drawings_images', 'notes' => null, 'law_version' => $law],


// ---- INDUSTRIAL DESIGN ----
            ['fee_code' => 'ID-FILING', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'ID-EXAM-BASE', 'expression' => 'max(1, id_variants)', 'metric_keys' => 'id_variants', 'notes' => 'Phí thẩm định theo số phương án', 'law_version' => $law],
            ['fee_code' => 'ID-CLASSIFICATION-LOCARNO', 'expression' => 'is_user_classified ? 0 : 1', 'metric_keys' => 'is_user_classified', 'notes' => 'Miễn phí nếu người nộp đơn tự phân loại', 'law_version' => $law],
            ['fee_code' => 'ID-GRANT-CERT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => null, 'law_version' => $law],
            ['fee_code' => 'ID-GRANT-CERT-ADD-VARIANT', 'expression' => 'max(0, id_variants-1)', 'metric_keys' => 'id_variants', 'notes' => 'Phương án bổ sung', 'law_version' => $law],
            ['fee_code' => 'ID-PUBLICATION-GRANT-BASE', 'expression' => '1', 'metric_keys' => null, 'notes' => 'Hình đầu tiên', 'law_version' => $law],
            ['fee_code' => 'ID-PUBLICATION-GRANT-ADDL-IMAGE', 'expression' => 'max(0, id_variants*id_images_per_variant - 1)', 'metric_keys' => 'id_variants,id_images_per_variant', 'notes' => 'Tổng hình = variants * images/variant', 'law_version' => $law],
            ['fee_code' => 'ID-REQ-RENEWAL', 'expression' => 'id_variants', 'metric_keys' => 'id_variants', 'notes' => 'Lệ phí gia hạn hiệu lực: 100.000 đồng/phương án', 'law_version' => $law],
        ];


        DB::table('fee_rules')->upsert($rows, ['fee_code', 'law_version']);
    }
}
