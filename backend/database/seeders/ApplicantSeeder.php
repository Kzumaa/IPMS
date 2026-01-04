<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ApplicantSeeder extends Seeder
{
    /**
     * Seed test applicant users.
     */
    public function run(): void
    {
        // Create individual applicant
        $applicant1 = [
            'full_name' => 'John Applicant',
            'email' => 'applicant@example.com',
            'password' => Hash::make('password'),
            'phone' => '0901234567',
            'citizen_id' => '001234567890',
            'address' => '123 Innovation Street, Hanoi, Vietnam',
            'country' => 'VN',
            'is_org' => false,
        ];

        // Create organization applicant
        // $applicant2 = [
        //     'full_name' => 'Tech Innovator',
        //     'email' => 'company@example.com',
        //     'password' => Hash::make('password'),
        //     'phone' => '0987654321',
        //     'org_name' => 'Tech Innovator Co., Ltd.',
        //     'address' => '456 Business Avenue, Ho Chi Minh City, Vietnam',
        //     'country' => 'VN',
        //     'is_org' => true,
        // ];

        DB::table('users')->insert([$applicant1]);

        $this->command->info('Applicant users created successfully!');
        $this->command->info('Individual: applicant@example.com / password');
        $this->command->info('Organization: company@example.com / password');
    }
}
