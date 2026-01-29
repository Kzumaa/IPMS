<?php

namespace Tests\Feature;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\AuthorityStaff;
use App\Models\FeeQuote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class StaffRequestFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_staff_cannot_see_draft_requests()
    {
        $staff = AuthorityStaff::factory()->create();
        Sanctum::actingAs($staff);

        $applicant = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $applicant->id]);

        // Create a DRAFT request
        $draftRequest = ApplicationRequest::factory()->create([
            'application_id' => $application->id,
            'created_by' => $applicant->id,
            'type' => RequestType::AMENDMENT,
            'status' => RequestStatus::DRAFT,
            'request_date' => now(),
        ]);
        
        // Ensure fee is paid so it would otherwise appear (if not for the status)
        FeeQuote::factory()->create([
            'application_id' => $application->id,
            'request_id' => $draftRequest->id,
            'status' => 'PAID',
        ]);

        $response = $this->getJson('/api/staff/requests');

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    public function test_staff_can_see_all_statuses_except_draft()
    {
        $staff = AuthorityStaff::factory()->create();
        Sanctum::actingAs($staff);

        $applicant = User::factory()->create();
        
        $statuses = [
            RequestStatus::SUBMITTED,
            RequestStatus::EXAMINING,
            RequestStatus::APPROVED,
            RequestStatus::REFUSED,
        ];

        foreach ($statuses as $status) {
            $application = Application::factory()->create(['created_by' => $applicant->id]);

            $req = ApplicationRequest::factory()->create([
                'application_id' => $application->id,
                'created_by' => $applicant->id,
                'type' => RequestType::AMENDMENT,
                'status' => $status,
                'request_date' => now(),
            ]);
            
            FeeQuote::factory()->create([
                'application_id' => $application->id,
                'request_id' => $req->id,
                'status' => 'PAID',
            ]);
        }

        $response = $this->getJson('/api/staff/requests');

        $response->assertStatus(200);
        $response->assertJsonCount(4, 'data');
    }

    public function test_staff_can_filter_by_status()
    {
        $staff = AuthorityStaff::factory()->create();
        Sanctum::actingAs($staff);

        $applicant = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $applicant->id]);

        // Create one APPROVED and one REFUSED
        $approved = ApplicationRequest::factory()->create([
            'application_id' => $application->id,
            'created_by' => $applicant->id,
            'type' => RequestType::AMENDMENT,
            'status' => RequestStatus::APPROVED,
            'request_date' => now(),
        ]);
        FeeQuote::factory()->create([
            'application_id' => $application->id,
            'request_id' => $approved->id,
            'status' => 'PAID',
        ]);

        $refusedApp = Application::factory()->create(['created_by' => $applicant->id]);

        $refused = ApplicationRequest::factory()->create([
            'application_id' => $refusedApp->id,
            'created_by' => $applicant->id,
            'type' => RequestType::AMENDMENT,
            'status' => RequestStatus::REFUSED,
            'request_date' => now(),
        ]);
        FeeQuote::factory()->create([
            'application_id' => $refusedApp->id,
            'request_id' => $refused->id,
            'status' => 'PAID',
        ]);

        // Filter for REFUSED
        $response = $this->getJson('/api/staff/requests?status=' . RequestStatus::REFUSED->value);

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['id' => $refused->id]);
        $response->assertJsonMissing(['id' => $approved->id]);
    }
}
