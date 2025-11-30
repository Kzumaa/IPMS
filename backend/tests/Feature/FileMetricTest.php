<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationAttachment;
use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileMetricTest extends TestCase
{
    use RefreshDatabase;

    public function test_analyze_application_files_pdf()
    {
        Storage::fake('s3');
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id]);
        
        $file = File::create([
            'storage' => 'S3',
            'bucket' => 'test',
            'object_key' => 'test.pdf',
            'filename' => 'test.pdf',
            'mime' => 'application/pdf',
            'size_bytes' => 123,
            'sha256' => 'hash1',
            'uploaded_by' => $user->id,
            'uploaded_at' => now(),
        ]);
        
        // Attach file to application
        ApplicationAttachment::create([
            'application_id' => $application->id,
            'file_id' => $file->id,
            'doc_type' => 'DESCRIPTION',
            'is_current' => true
        ]);

        // Mock S3 file
        Storage::disk('s3')->put('test.pdf', 'dummy content');

        // Mock service to return success
        $this->mock(\App\Services\File\FileMetricService::class, function ($mock) {
            $mock->shouldReceive('analyze')
                ->once()
                ->andReturn([
                    'status' => 'processed',
                    'message' => 'Success',
                    'metrics' => ['page_count' => 5]
                ]);
        });

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/analyze");

        $response->assertStatus(200)
            ->assertJsonPath('file_results.0.status', 'processed')
            ->assertJsonPath('file_results.0.metrics.page_count', 5);
    }

    public function test_analyze_application_files_non_pdf_skipped()
    {
        Storage::fake('s3');
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id]);
        
        $file = File::create([
            'storage' => 'S3',
            'bucket' => 'test',
            'object_key' => 'image.jpg',
            'filename' => 'image.jpg',
            'mime' => 'image/jpeg',
            'size_bytes' => 123,
            'sha256' => 'hash2',
            'uploaded_by' => $user->id,
            'uploaded_at' => now(),
        ]);
        
        ApplicationAttachment::create([
            'application_id' => $application->id,
            'file_id' => $file->id,
            'doc_type' => 'DRAWINGS',
            'is_current' => true
        ]);

        // We don't mock here to test the service logic for non-PDF check
        // But we need to make sure the service is used correctly.
        // Actually, let's just rely on the real service logic for the check.
        // The service checks mime type first.
        
        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/analyze");

        $response->assertStatus(200)
            ->assertJsonPath('file_results.0.status', 'skipped')
            ->assertJsonPath('warning', 'Some files require manual verification.');
    }
}
