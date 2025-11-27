<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staff = [
            'full_name' => "Staff",
            'email' => "staff@ipvietnam.gov.vn",
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'role' => 'FORMALITY_OFFICER',
            'is_active' => true,
        ]; 

        $org = [
            'name' => "Staff",
            'org_type' => 'DEPARTMENT',
            'address' => "Staff",
        ];

        $id = DB::table('authority_orgs')->insert($org);

        $staff['org_id'] = $id;

        DB::table('authority_staff')->insert($staff);
    }
}
