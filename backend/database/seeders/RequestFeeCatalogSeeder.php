<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequestFeeCatalogSeeder extends Seeder
{
    /**
     * Seed request-related fees for Amendment, Assignment, License, Split, and Complaints.
     */
    public function run(): void
    {
        $law = 'TT263-2016'; // Thông tư 263/2016/TT-BTC
        $from = '2017-01-01';

        $rows = [
            // Amendment fees (Phí sửa đổi đơn)
            ['code' => 'PAT-REQ-AMEND', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định yêu cầu sửa đổi đơn', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-AMEND', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định yêu cầu sửa đổi đơn', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-AMEND', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định yêu cầu sửa đổi đơn', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // Assignment/Transfer fees (Phí ghi nhận chuyển nhượng) - SRS: 160,000 VND
            ['code' => 'PAT-REQ-ASSIGN', 'app_type' => 'PATENT', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-ASSIGN', 'app_type' => 'UTILITY', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-ASSIGN', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 160000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // License fees - Certificate (Lệ phí cấp Giấy chứng nhận đăng ký hợp đồng) - 120,000 VND
            ['code' => 'PAT-LICENSE-CERT', 'app_type' => 'PATENT', 'label' => 'Lệ phí cấp Giấy chứng nhận đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-LICENSE-CERT', 'app_type' => 'UTILITY', 'label' => 'Lệ phí cấp Giấy chứng nhận đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-LICENSE-CERT', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Lệ phí cấp Giấy chứng nhận đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],

            // License fees - Examination (Phí thẩm định hồ sơ đăng ký hợp đồng) - 230,000 VND
            ['code' => 'PAT-LICENSE-EXAM', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định hồ sơ đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 230000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-LICENSE-EXAM', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định hồ sơ đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 230000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-LICENSE-EXAM', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định hồ sơ đăng ký hợp đồng', 'basis' => 'FIXED', 'unit_price' => 230000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],

            // License fees - Publication (Phí công bố Quyết định ghi nhận chuyển quyền sử dụng) - 120,000 VND
            ['code' => 'PAT-LICENSE-PUB', 'app_type' => 'PATENT', 'label' => 'Phí công bố Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-LICENSE-PUB', 'app_type' => 'UTILITY', 'label' => 'Phí công bố Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-LICENSE-PUB', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí công bố Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],

            // License fees - Registration (Phí đăng bạ Quyết định ghi nhận chuyển quyền sử dụng) - 120,000 VND
            ['code' => 'PAT-LICENSE-REG', 'app_type' => 'PATENT', 'label' => 'Phí đăng bạ Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-LICENSE-REG', 'app_type' => 'UTILITY', 'label' => 'Phí đăng bạ Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-LICENSE-REG', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí đăng bạ Quyết định ghi nhận chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 120000, 'unit_name' => 'VBBH', 'law_version' => $law, 'effective_from' => $from],

            // Split fees (Phí tách đơn)
            ['code' => 'PAT-REQ-SPLIT', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-SPLIT', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-SPLIT', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // Complaint fees (Phí thẩm định khiếu nại) - SRS: fee required for complaints
            ['code' => 'PAT-REQ-COMPLAINT', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-COMPLAINT', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-COMPLAINT', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // Renewal fees (Phí gia hạn) - SRS: 100,000 VND per option/class
            ['code' => 'PAT-REQ-RENEWAL', 'app_type' => 'PATENT', 'label' => 'Phí gia hạn hiệu lực văn bằng', 'basis' => 'PER_CLASS', 'unit_price' => 100000, 'unit_name' => 'điểm độc lập', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-RENEWAL', 'app_type' => 'UTILITY', 'label' => 'Phí gia hạn hiệu lực văn bằng', 'basis' => 'PER_CLASS', 'unit_price' => 100000, 'unit_name' => 'điểm độc lập', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-RENEWAL', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí gia hạn hiệu lực văn bằng', 'basis' => 'PER_CLASS', 'unit_price' => 100000, 'unit_name' => 'phương án', 'law_version' => $law, 'effective_from' => $from],

            // Termination fees (Phí chấm dứt) - SRS: 50,000 VND per application
            ['code' => 'PAT-REQ-TERMINATE', 'app_type' => 'PATENT', 'label' => 'Phí yêu cầu chấm dứt hiệu lực văn bằng', 'basis' => 'FIXED', 'unit_price' => 50000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-TERMINATE', 'app_type' => 'UTILITY', 'label' => 'Phí yêu cầu chấm dứt hiệu lực văn bằng', 'basis' => 'FIXED', 'unit_price' => 50000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-TERMINATE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí yêu cầu chấm dứt hiệu lực văn bằng', 'basis' => 'FIXED', 'unit_price' => 50000, 'unit_name' => 'đơn', 'law_version' => $law, 'effective_from' => $from],
        ];

        DB::table('fee_catalog')->upsert($rows, ['code', 'app_type', 'law_version']);
    }
}
