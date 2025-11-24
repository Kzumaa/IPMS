<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\AuthorityOrg;
use App\Models\AuthorityStaff;
use App\Models\DecisionRecord;
use App\Models\MaintenanceSchedule;
use App\Models\ProtectionTitle;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $examiner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        
        $org = AuthorityOrg::create([
            'name' => 'IP Office HQ',
            'org_type' => 'HQ',
        ]);

        $this->examiner = AuthorityStaff::create([
            'full_name' => 'Decision Maker',
            'email' => 'decision@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'EXAMINER',
            'is_active' => true,
        ]);
    }

    public function test_schedule_generated_on_grant()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'GRANTED',
            'current_assignee_id' => $this->examiner->id,
        ]);

        $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/decision", [
            'type' => 'GRANT',
            'notes' => 'Granting',
        ]);

        $title = ProtectionTitle::where('application_id', $application->id)->first();
        $this->assertNotNull($title);

        $this->assertDatabaseHas('maintenance_schedules', [
            'protection_title_id' => $title->id,
            'year' => 1,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseCount('maintenance_schedules', 20);
    }

    public function test_can_pay_maintenance_fee()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'GRANTED',
        ]);

        $title = ProtectionTitle::create([
            'application_id' => $application->id,
            'registration_number' => 'VN-TEST-123',
            'issue_date' => now(),
            'expiry_date' => now()->addYears(20),
            'status' => 'ACTIVE',
        ]);

        $schedule = MaintenanceSchedule::create([
            'protection_title_id' => $title->id,
            'year' => 1,
            'due_date' => now(),
            'amount' => 1000000,
            'status' => 'PENDING',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/maintenance-fees/{$schedule->id}/pay");

        $response->assertStatus(200);

        $this->assertDatabaseHas('maintenance_schedules', [
            'id' => $schedule->id,
            'status' => 'PAID',
        ]);
    }
}
