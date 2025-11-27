<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use App\Models\ApplicationAttachment;
use App\Models\File;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConditionalFileValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_requires_priority_doc_if_priority_claimed()
    {
        $this->seed();
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id, 'app_type' => 'PATENT']);

        // 1. Add Priority Claim (updates metrics)
        $this->actingAs($user)->putJson("/api/applications/{$application->id}", [
            'priority_claims' => [
                ['number' => 'US123', 'country_code' => 'US', 'filing_date' => '2024-01-01']
            ]
        ]);

        // 2. Add Standard Required Files (Description, Claims, Abstract)
        $this->createAttachment($application, 'DESCRIPTION');
        $this->createAttachment($application, 'CLAIMS');
        $this->createAttachment($application, 'ABSTRACT');

        // 3. Try to Submit -> Should Fail (Missing PRIORITY_DOC)
        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/submit");
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['files']);
        $this->assertStringContainsString('PRIORITY_DOC', $response->json('errors.files.0')); // Check error message

        // 4. Add PRIORITY_DOC
        $this->createAttachment($application, 'PRIORITY_DOC');

        // 5. Submit -> Should Success
        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/submit");
        $response->assertStatus(200);
    }

    private function createAttachment($application, $type)
    {
        $file = File::create([
            'storage' => 'R2',
            'bucket' => 'test',
            'object_key' => 'test/' . uniqid(),
            'filename' => 'test.pdf',
            'uploaded_by' => $application->created_by,
            'sha256' => hash('sha256', uniqid()),
        ]);

        ApplicationAttachment::create([
            'application_id' => $application->id,
            'file_id' => $file->id,
            'doc_type' => $type,
        ]);
    }
}
