<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\FeeCatalog;
use App\Models\FeeRule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_application()
    {
        $response = $this->actingAs($this->user)->postJson('/api/applications', [
            'app_type' => 'PATENT',
            'title' => 'My Invention',
            'applicant_is_inventor' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'app_type' => 'PATENT',
                'title' => 'My Invention',
                'status' => 'DRAFT',
            ]);

        $this->assertDatabaseHas('applications', [
            'title' => 'My Invention',
            'created_by' => $this->user->id,
        ]);

        $this->assertDatabaseHas('application_metrics', [
            'application_id' => $response->json('id'),
        ]);

        $this->assertDatabaseHas('application_parties', [
            'role' => 'APPLICANT',
            'user_id' => $this->user->id,
        ]);

        $this->assertDatabaseHas('application_parties', [
            'role' => 'INVENTOR',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_can_update_metrics()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'app_type' => 'PATENT',
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/applications/{$application->id}/metrics", [
            'claims_independent' => 2,
            'claims_total' => 10,
            'description_pages' => 50,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('application_metrics', [
            'application_id' => $application->id,
            'claims_independent' => 2,
            'claims_total' => 10,
            'description_pages' => 50,
        ]);
    }

    public function test_can_generate_fee_quote()
    {
        $application = Application::factory()->create([
            'created_by' => $this->user->id,
            'app_type' => 'PATENT',
        ]);

        // Seed fee data
        $catalog = FeeCatalog::create([
            'code' => 'FEE01',
            'app_type' => 'PATENT',
            'label' => 'Filing Fee',
            'basis' => 'PER_APP',
            'unit_price' => 1000000,
            'law_version' => '2025',
        ]);

        FeeRule::create([
            'fee_code' => 'FEE01',
            'expression' => '1',
            'law_version' => '2025',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/applications/{$application->id}/fee-quotes/generate", [
            'law_version' => '2025',
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('fee_quotes', [
            'application_id' => $application->id,
            'total_amount' => 1000000,
        ]);
    }
}
