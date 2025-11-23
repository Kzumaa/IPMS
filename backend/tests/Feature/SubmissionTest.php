<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\AuthorityOrg;
use App\Models\AuthorityStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $examiner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        
        // Create an org for staff
        $org = AuthorityOrg::create([
            'name' => 'IP Office HQ',
            'org_type' => 'HQ',
        ]);

        // Create a formality examiner
        $this->examiner = AuthorityStaff::create([
            'full_name' => 'Formality Examiner',
            'email' => 'examiner@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'FORMALITY_OFFICER',
            'is_active' => true,
        ]);
    }

    public function test_can_submit_application()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'DRAFT',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/applications/{$application->id}/submit");


        $response->assertStatus(200)
            ->assertJson([
                'status' => 'SUBMITTED',
                'current_assignee_id' => $this->examiner->id,
            ]);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'SUBMITTED',
            'current_assignee_id' => $this->examiner->id,
        ]);

        $this->assertDatabaseHas('application_assignments', [
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'stage' => 'FORMALITY_EXAM',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_cannot_submit_non_draft_application()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUBMITTED',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/applications/{$application->id}/submit");

        $response->assertStatus(400);
    }
}
