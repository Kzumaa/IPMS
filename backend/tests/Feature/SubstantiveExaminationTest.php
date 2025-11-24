<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationAssignment;
use App\Models\AuthorityOrg;
use App\Models\AuthorityStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubstantiveExaminationTest extends TestCase
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
            'full_name' => 'Substantive Examiner',
            'email' => 'examiner@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'EXAMINER',
            'is_active' => true,
        ]);

        $this->otherExaminer = AuthorityStaff::create([
            'full_name' => 'Other Examiner',
            'email' => 'other@ip.gov.vn',
            'password' => 'password',
            'org_id' => $org->id,
            'role' => 'EXAMINER',
            'is_active' => true,
        ]);
    }

    public function test_assigned_examiner_can_complete_examination_acceptable()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUB_EXAM',
            'current_assignee_id' => $this->examiner->id,
        ]);

        ApplicationAssignment::create([
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'stage' => 'SUBSTANTIVE_EXAM',
            'status' => 'ACTIVE',
            'assigned_by_id' => $this->examiner->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/substantive-examination/complete", [
            'result' => 'ACCEPTABLE',
            'notes' => 'Meets all requirements',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'GRANTED',
        ]);

        $this->assertDatabaseHas('substantive_exam_records', [
            'application_id' => $application->id,
            'examiner_id' => $this->examiner->id,
            'result' => 'ACCEPTABLE',
        ]);

        $this->assertDatabaseHas('application_assignments', [
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'status' => 'COMPLETED',
        ]);
    }

    public function test_assigned_examiner_can_complete_examination_objection()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUB_EXAM',
            'current_assignee_id' => $this->examiner->id,
        ]);

        ApplicationAssignment::create([
            'application_id' => $application->id,
            'staff_id' => $this->examiner->id,
            'stage' => 'SUBSTANTIVE_EXAM',
            'status' => 'ACTIVE',
            'assigned_by_id' => $this->examiner->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($this->examiner)->postJson("/api/applications/{$application->id}/substantive-examination/complete", [
            'result' => 'OBJECTION',
            'notes' => 'Needs clarification',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'WAITING_RESPONSE',
        ]);
    }

    public function test_other_examiner_cannot_examine()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'status' => 'SUB_EXAM',
            'current_assignee_id' => $this->examiner->id,
        ]);

        $response = $this->actingAs($this->otherExaminer)->postJson("/api/applications/{$application->id}/substantive-examination/complete", [
            'result' => 'ACCEPTABLE',
        ]);

        $response->assertStatus(403);
    }
}
