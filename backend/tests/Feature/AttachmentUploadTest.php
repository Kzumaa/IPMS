<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_attachment()
    {
        Storage::fake('s3');
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id]);

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/attachments", [
            'file' => $file,
            'doc_type' => 'DESCRIPTION',
            'notes' => 'Initial version'
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['id', 'doc_type', 'file' => ['object_key', 'url']]);

        // Verify DB
        $this->assertDatabaseHas('files', [
            'filename' => 'document.pdf',
            'uploaded_by' => $user->id
        ]);
        $this->assertDatabaseHas('application_attachments', [
            'application_id' => $application->id,
            'doc_type' => 'DESCRIPTION',
            'is_current' => true
        ]);

        // Verify Storage
        // Note: We can't easily guess the UUID path, but we can check if *any* file was stored or check the path from response
        $path = $response->json('file.object_key');
        Storage::disk('s3')->assertExists($path);
    }

    public function test_upload_fails_invalid_type()
    {
        $user = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $user->id]);

        $response = $this->actingAs($user)->postJson("/api/applications/{$application->id}/attachments", [
            'doc_type' => 'INVALID_TYPE',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file', 'doc_type']);
    }

    public function test_cannot_upload_to_others_application()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $application = Application::factory()->create(['created_by' => $owner->id]);

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->actingAs($otherUser)->postJson("/api/applications/{$application->id}/attachments", [
            'file' => $file,
            'doc_type' => 'DESCRIPTION',
        ]);

        $response->assertStatus(403);
    }
}
