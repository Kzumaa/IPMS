<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OriginClassificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_update_application_with_priority_and_classification()
    {
        $this->seed(); // Seed fees
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id, 'app_type' => 'PATENT']);

        $data = [
            'priority_claims' => [
                [
                    'number' => 'US123456',
                    'country_code' => 'US',
                    'filing_date' => '2024-01-01',
                    'kind' => 'PARIS'
                ]
            ],
            'ipc_classes' => [
                ['ipc_code' => 'A01B', 'version' => '2024.01'],
                ['ipc_code' => 'C07D', 'version' => '2024.01']
            ]
        ];

        $this->withoutExceptionHandling();
        $response = $this->actingAs($user)->putJson("/api/applications/{$application->id}", $data);

        $response->assertStatus(200);

        // Verify DB
        $this->assertDatabaseHas('priority_claims', [
            'application_id' => $application->id,
            'number' => 'US123456'
        ]);
        $this->assertDatabaseHas('ipc_classes', [
            'application_id' => $application->id,
            'ipc_code' => 'A01B'
        ]);

        // Verify Metrics
        $this->assertDatabaseHas('application_metrics', [
            'application_id' => $application->id,
            'priority_count' => 1,
            'ipc_groups' => 2,
            'is_user_classified' => true
        ]);
    }

    public function test_classification_fee_logic()
    {
        $this->seed();
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id, 'app_type' => 'PATENT']);

        // Case 1: User classifies (Fee should be 0)
        $this->actingAs($user)->putJson("/api/applications/{$application->id}", [
            'ipc_classes' => [['ipc_code' => 'A01B']]
        ]);
        
        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/fee-quotes/generate", [
            'law_version' => 'TT263-2016'
        ]);
        $response->assertStatus(200);
        
        // Fee for PAT-CLASSIFICATION-IPC should be 0 * 100k = 0
        // Or strictly, the line might not appear or be 0.
        // Our logic: is_user_classified ? 0 : 1.
        // So units = 0.
        $quote = $response->json();
        // Find the line
        $lines = collect($quote['lines']);
        $classLine = $lines->firstWhere('fee_code', 'PAT-CLASSIFICATION-IPC');
        
        // If units is 0, amount is 0.
        $this->assertEquals(0, $classLine['amount'] ?? 0);


        // Case 2: User does NOT classify (Fee should be 100k)
        // Clear classes
        $this->actingAs($user)->putJson("/api/applications/{$application->id}", [
            'ipc_classes' => []
        ]);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/fee-quotes/generate", [
            'law_version' => 'TT263-2016'
        ]);
        $quote = $response->json();
        $lines = collect($quote['lines']);
        $classLine = $lines->firstWhere('fee_code', 'PAT-CLASSIFICATION-IPC');

        // Logic: is_user_classified (false) ? 0 : 1. So units = 1.
        // Price = 100,000.
        $this->assertNotNull($classLine);
        $this->assertEquals(100000, $classLine['amount']);
    }
}
