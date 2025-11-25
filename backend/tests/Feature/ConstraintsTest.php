<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationAttachment;
use App\Models\ApplicationMetric;
use App\Models\AuthorityStaff;
use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConstraintsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\FeeCatalogSeeder::class);
        $this->seed(\Database\Seeders\FeeRulesSeeder::class);
    }

    public function test_submission_fails_missing_files_patent()
    {
        $user = User::factory()->create();
        $application = Application::factory()->create([
            'created_by' => $user->id,
            'app_type' => 'PATENT',
            'status' => 'DRAFT'
        ]);
        ApplicationMetric::create(['application_id' => $application->id]);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/submit");

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['files']);
        $this->assertStringContainsString('DESCRIPTION', $response->json('errors.files.0'));
    }

    public function test_submission_succeeds_with_files_patent()
    {
        $user = User::factory()->create();
        $application = Application::factory()->create([
            'created_by' => $user->id,
            'app_type' => 'PATENT',
            'status' => 'DRAFT'
        ]);
        ApplicationMetric::create(['application_id' => $application->id]);

        // Create dummy files
        $file = File::create([
            'storage' => 'S3', 'bucket' => 'test', 'object_key' => 'test', 'filename' => 'test.pdf', 'uploaded_by' => $user->id, 'sha256' => 'hash' . rand()
        ]);

        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'DESCRIPTION']);
        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'CLAIMS']);
        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'ABSTRACT']);

        // Create staff for assignment
        AuthorityStaff::factory()->create(['role' => 'FORMALITY_OFFICER']);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/submit");

        $response->assertStatus(200);
        $application->refresh();
        $this->assertEquals('SUBMITTED', $application->status->value);
        $this->assertNotNull($application->deadlines);
        $this->assertNotNull($application->deadlines['formality_exam']);
        $this->assertNotNull($application->deadlines['publication']);
        $this->assertNotNull($application->deadlines['substantive_exam_request']);
    }

    public function test_fees_recalculated_on_submission()
    {
        $user = User::factory()->create();
        $application = Application::factory()->create([
            'created_by' => $user->id,
            'app_type' => 'PATENT',
            'status' => 'DRAFT'
        ]);
        // Set metrics that trigger surcharges
        ApplicationMetric::create([
            'application_id' => $application->id,
            'claims_independent' => 2, // Should trigger surcharge
            'description_pages' => 10 // Should trigger surcharge
        ]);

        // Attach files
        $file = File::create([
            'storage' => 'S3', 'bucket' => 'test', 'object_key' => 'test', 'filename' => 'test.pdf', 'uploaded_by' => $user->id, 'sha256' => 'hash' . rand()
        ]);
        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'DESCRIPTION']);
        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'CLAIMS']);
        ApplicationAttachment::create(['application_id' => $application->id, 'file_id' => $file->id, 'doc_type' => 'ABSTRACT']);

        AuthorityStaff::factory()->create(['role' => 'FORMALITY_OFFICER']);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/submit");

        $response->assertStatus(200);
        
        // Check FeeQuote
        $quote = \App\Models\FeeQuote::where('application_id', $application->id)->latest('id')->first();
        $this->assertNotNull($quote);
        
        // Check for surcharges
        $this->assertTrue($quote->lines()->where('fee_code', 'PAT-EXAM-FORMALITY-SURCHARGE')->exists());
        $this->assertTrue($quote->lines()->where('fee_code', 'PAT-EXAM-PAGE-SURCHARGE')->exists());
    }
}
