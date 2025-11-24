<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationAssignment;
use App\Models\AuthorityOrg;
use App\Models\AuthorityStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DecisionTest extends TestCase
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

    public function test_can_issue_grant_decision()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'GRANTED', // Already marked as granted by Substantive Exam
            'current_assignee_id' => $this->examiner->id,
        ]);

        $response = $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/decision", [
            'type' => 'GRANT',
            'notes' => 'Official Grant',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('decision_records', [
            'application_id' => $application->id,
            'type' => 'GRANT',
        ]);

        $this->assertDatabaseHas('protection_titles', [
            'application_id' => $application->id,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_can_issue_refuse_decision()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'REFUSED', // Already marked as refused by Substantive Exam
            'current_assignee_id' => $this->examiner->id,
        ]);

        $response = $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/decision", [
            'type' => 'REFUSE',
            'notes' => 'Official Refusal',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('decision_records', [
            'application_id' => $application->id,
            'type' => 'REFUSE',
        ]);

        $this->assertDatabaseMissing('protection_titles', [
            'application_id' => $application->id,
        ]);
    }
}
