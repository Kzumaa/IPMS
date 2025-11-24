<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationAssignment;
use App\Models\AuthorityOrg;
use App\Models\AuthorityStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormalityExaminationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $examiner;
    protected $otherExaminer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        
        $org = AuthorityOrg::create([
            'name' => 'IP Office HQ',
            'org_type' => 'HQ',
        ]);

        $this->examiner = AuthorityStaff::create([
            'full_name' => 'Formality Examiner',
            'email' => 'examiner@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'FORMALITY_OFFICER',
            'is_active' => true,
        ]);

        $this->otherExaminer = AuthorityStaff::create([
            'full_name' => 'Other Examiner',
            'email' => 'other@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'FORMALITY_OFFICER',
            'is_active' => true,
        ]);
    }

    public function test_assigned_officer_can_complete_examination_pass()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUBMITTED',
            'current_assignee_id' => $this->examiner->id,
        ]);

        ApplicationAssignment::create([
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'stage' => 'FORMALITY_EXAM',
            'status' => 'ACTIVE',
            'assigned_by_id' => $this->examiner->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/examination/complete", [
            'result' => 'PASS',
            'notes' => 'Looks good',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'PUBLISHED',
        ]);

        $this->assertDatabaseHas('formality_exam_records', [
            'application_id' => $application->id,
            'examiner_id' => $this->examiner->id,
            'result' => 'PASS',
        ]);

        $this->assertDatabaseHas('application_assignments', [
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'status' => 'COMPLETED',
        ]);
    }

    public function test_other_officer_cannot_examine()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUBMITTED',
            'current_assignee_id' => $this->examiner->id,
        ]);

        $response = $this->actingAs($this->otherExaminer)->postJson("/api/applications/{$application->id}/examination/complete", [
            'result' => 'PASS',
        ]);

        $response->assertStatus(403);
    }
}
