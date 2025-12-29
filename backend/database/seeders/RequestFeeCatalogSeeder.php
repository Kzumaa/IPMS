<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequestFeeCatalogSeeder extends Seeder
{
    /**
     * Seed request-related fees for Amendment, Assignment, License, Split, and Appeals.
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

            // Assignment/Transfer fees (Phí ghi nhận chuyển nhượng)
            ['code' => 'PAT-REQ-ASSIGN', 'app_type' => 'PATENT', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 200000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-ASSIGN', 'app_type' => 'UTILITY', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 200000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-ASSIGN', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí ghi nhận chuyển nhượng quyền sở hữu', 'basis' => 'FIXED', 'unit_price' => 200000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // License fees (Phí ghi nhận hợp đồng li-xăng)
            ['code' => 'PAT-REQ-LICENSE', 'app_type' => 'PATENT', 'label' => 'Phí ghi nhận hợp đồng chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 250000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-LICENSE', 'app_type' => 'UTILITY', 'label' => 'Phí ghi nhận hợp đồng chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 250000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-LICENSE', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí ghi nhận hợp đồng chuyển quyền sử dụng', 'basis' => 'FIXED', 'unit_price' => 250000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // Split fees (Phí tách đơn)
            ['code' => 'PAT-REQ-SPLIT', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-SPLIT', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-SPLIT', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định yêu cầu tách đơn', 'basis' => 'FIXED', 'unit_price' => 300000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],

            // Appeal fees (Phí thẩm định khiếu nại)
            ['code' => 'PAT-REQ-APPEAL', 'app_type' => 'PATENT', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'UTL-REQ-APPEAL', 'app_type' => 'UTILITY', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
            ['code' => 'ID-REQ-APPEAL', 'app_type' => 'INDUSTRIAL_DESIGN', 'label' => 'Phí thẩm định khiếu nại', 'basis' => 'FIXED', 'unit_price' => 500000, 'unit_name' => 'yêu cầu', 'law_version' => $law, 'effective_from' => $from],
        ];

        DB::table('fee_catalog')->upsert($rows, ['code', 'app_type', 'law_version']);
    }
}
