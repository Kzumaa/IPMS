<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Application;
use App\Models\ApplicationParty;
use App\Enums\AppType;
use App\Enums\ApplicationStatus;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test user
        $user = User::create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'is_org' => false,
        ]);

        // Create test applications
        $app1 = Application::create([
            'app_no' => null,
            'app_type' => AppType::PATENT,
            'title' => 'Quantum Computing Algorithm',
            'status' => ApplicationStatus::DRAFT,
            'applicant_is_inventor' => true,
            'publication_early_requested' => false,
            'pub_delay_months' => null,
            'receiving_org_id' => null,
            'current_assignee_id' => null,
            'created_by' => $user->id,
        ]);

        $app2 = Application::create([
            'app_no' => 'VN001234',
            'app_type' => AppType::INDUSTRIAL_DESIGN,
            'title' => 'Modern Chair Design',
            'filing_date' => now()->subDays(30),
            'status' => ApplicationStatus::SUBMITTED,
            'applicant_is_inventor' => false,
            'publication_early_requested' => false,
            'pub_delay_months' => null,
            'receiving_org_id' => null,
            'current_assignee_id' => null,
            'created_by' => $user->id,
        ]);

        $app3 = Application::create([
            'app_no' => null,
            'app_type' => AppType::UTILITY,
            'title' => 'Water Purification Device',
            'status' => ApplicationStatus::DRAFT,
            'applicant_is_inventor' => true,
            'publication_early_requested' => false,
            'pub_delay_months' => null,
            'receiving_org_id' => null,
            'current_assignee_id' => null,
            'created_by' => $user->id,
        ]);

        // Add parties to app1
        ApplicationParty::create([
            'application_id' => $app1->id,
            'role' => 'APPLICANT',
            'user_id' => $user->id,
            'snapshot_name' => 'Test User',
            'snapshot_address' => '123 Main St, Hanoi, Vietnam',
            'snapshot_email' => 'test@example.com',
            'nationality' => 'VN',
            'is_primary' => true,
        ]);

        ApplicationParty::create([
            'application_id' => $app1->id,
            'role' => 'INVENTOR',
            'user_id' => $user->id,
            'snapshot_name' => 'John Inventor',
            'snapshot_address' => '456 Innovation Ave, HCMC, Vietnam',
            'snapshot_email' => 'inventor@example.com',
            'nationality' => 'VN',
            'is_primary' => false,
        ]);

        $this->command->info('Test data created successfully!');
        $this->command->info("User: {$user->email} / password");
        $this->command->info("Applications created: 3");
        $this->command->info("Parties created: 2");
    }
}
