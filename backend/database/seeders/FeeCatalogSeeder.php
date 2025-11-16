<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $law = 'TT263-2016'; // Thông tư 263/2016/TT-BTC (hiệu lực 01/01/2017)
        $from = '2017-01-01';


        $rows = [
// --- PATENT ---
            ['code' => 'PAT-FILING', 'app_type' => 'PATENT', 'label' => 'Lệ phí nộp đơn', 'basis' => 'FIXED', 'unit_price' => 150000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-EXAM-FORMALITY-BASE', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định hình thức (20% mức thu 900k)', 'basis' => 'FIXED', 'unit_price' => 180000, 'unit_name' => 'lần', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-EXAM-SUBSTANTIVE-BASE', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định nội dung (80% mức thu 900k)', 'basis' => 'FIXED', 'unit_price' => 720000, 'unit_name' => 'lần', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-EXAM-PAGE-SURCHARGE', 'app_type' => 'PATENT', 'label' => 'Phí trang bản mô tả từ trang 7 trở đi', 'basis' => 'PER_PAGE', 'unit_price' => 40000, 'unit_name' => 'trang >6', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-CLASSIFICATION-IPC', 'app_type' => 'PATENT', 'label' => 'Phí phân loại quốc tế (IPC) mỗi phân nhóm', 'basis' => 'PER_UNIT', 'unit_price' => 100000, 'unit_name' => 'nhóm', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-PRIORITY-EXAM', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định yêu cầu hưởng quyền ưu tiên', 'basis' => 'PER_UNIT', 'unit_price' => 600000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-GRANT-CERT-BASE', 'app_type' => 'PATENT', 'label' => 'Lệ phí cấp VBBH (cho điểm độc lập đầu tiên)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bằng', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-GRANT-CERT-ADD-INDEP', 'app_type' => 'PATENT', 'label' => 'Lệ phí cấp VBBH từ điểm độc lập thứ 2 trở đi (mỗi điểm)', 'basis' => 'PER_INDEP_CLAIM', 'unit_price' => 100000, 'unit_name' => 'điểm độc lập bổ sung', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-PUBLICATION-GRANT-BASE', 'app_type' => 'PATENT', 'label' => 'Phí công bố QĐ cấp VBBH (hình đầu tiên)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bài', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'PAT-PUBLICATION-GRANT-ADDL-IMAGE', 'app_type' => 'PATENT', 'label' => 'Phí công bố QĐ cấp VBBH từ hình thứ 2 trở đi (mỗi hình)', 'basis' => 'PER_IMAGE', 'unit_price' => 60000, 'unit_name' => 'hình bổ sung', 'law_version' => $law, 'effective_from' => $from],


// --- UTILITY (giải pháp hữu ích) áp dụng mức sáng chế ---
            ['code' => 'UTL-FILING', 'app_type' => 'UTILITY', 'label' => 'Lệ phí nộp đơn', 'basis' => 'FIXED', 'unit_price' => 150000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-EXAM-FORMALITY-BASE', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định hình thức (20% mức thu 900k)', 'basis' => 'FIXED', 'unit_price' => 180000, 'unit_name' => 'lần', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-EXAM-SUBSTANTIVE-BASE', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định nội dung (80% mức thu 900k)', 'basis' => 'FIXED', 'unit_price' => 720000, 'unit_name' => 'lần', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-EXAM-PAGE-SURCHARGE', 'app_type' => 'UTILITY', 'label' => 'Phí trang bản mô tả từ trang 7 trở đi', 'basis' => 'PER_PAGE', 'unit_price' => 40000, 'unit_name' => 'trang >6', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-CLASSIFICATION-IPC', 'app_type' => 'UTILITY', 'label' => 'Phí phân loại quốc tế (IPC) mỗi phân nhóm', 'basis' => 'PER_UNIT', 'unit_price' => 100000, 'unit_name' => 'nhóm', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-PRIORITY-EXAM', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định yêu cầu hưởng quyền ưu tiên', 'basis' => 'PER_UNIT', 'unit_price' => 600000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-GRANT-CERT-BASE', 'app_type' => 'UTILITY', 'label' => 'Lệ phí cấp VBBH (cho điểm độc lập đầu tiên)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bằng', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-GRANT-CERT-ADD-INDEP', 'app_type' => 'UTILITY', 'label' => 'Lệ phí cấp VBBH từ điểm độc lập thứ 2 trở đi (mỗi điểm)', 'basis' => 'PER_INDEP_CLAIM', 'unit_price' => 100000, 'unit_name' => 'điểm độc lập bổ sung', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-PUBLICATION-GRANT-BASE', 'app_type' => 'UTILITY', 'label' => 'Phí công bố QĐ cấp VBBH (hình đầu tiên)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bài', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-PUBLICATION-GRANT-ADDL-IMAGE', 'app_type' => 'UTILITY', 'label' => 'Phí công bố QĐ cấp VBBH từ hình thứ 2 trở đi (mỗi hình)', 'basis' => 'PER_IMAGE', 'unit_price' => 60000, 'unit_name' => 'hình bổ sung', 'law_version' => $law, 'effective_from' => $from],


// --- INDUSTRIAL DESIGN ---
            ['code' => 'ID-FILING', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Lệ phí nộp đơn', 'basis' => 'FIXED', 'unit_price' => 150000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-EXAM-BASE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định đơn', 'basis' => 'FIXED', 'unit_price' => 700000, 'unit_name' => 'lần', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-CLASSIFICATION-LOCARNO', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí phân loại quốc tế (Locarno) mỗi phân nhóm', 'basis' => 'PER_UNIT', 'unit_price' => 100000, 'unit_name' => 'nhóm', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-GRANT-CERT-BASE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Lệ phí cấp VBBH (cho 01 phương án)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bằng', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-GRANT-CERT-ADD-VARIANT', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Lệ phí cấp VBBH từ phương án thứ 2 trở đi (mỗi phương án)', 'basis' => 'PER_VARIANT', 'unit_price' => 100000, 'unit_name' => 'PA bổ sung', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-PUBLICATION-GRANT-BASE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí công bố QĐ cấp VBBH (hình đầu tiên)', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'bài', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-PUBLICATION-GRANT-ADDL-IMAGE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí công bố QĐ cấp VBBH từ hình thứ 2 trở đi (mỗi hình)', 'basis' => 'PER_IMAGE', 'unit_price' => 60000, 'unit_name' => 'hình bổ sung', 'law_version' => $law, 'effective_from' => $from],
        ];


        DB::table('fee_catalog')->upsert($rows, ['code', 'app_type', 'law_version']);
    }
}
