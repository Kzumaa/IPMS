<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationAttachmentResource;
use App\Models\Application;
use App\Models\ApplicationAttachment;
use App\Services\File\FileService;
use Illuminate\Http\Request;

class ApplicationAttachmentController extends Controller
{
    protected $fileService;

    public function __construct(FileService $fileService)
    {
        $this->fileService = $fileService;
    }

    public function index($applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $attachments = $application->attachments()
            ->with('file')
            ->where('is_current', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => ApplicationAttachmentResource::collection($attachments)]);
    }

    public function store(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $this->authorize('update', $application);

        $validated = $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
            'doc_type' => 'required|string|in:FORM,DESCRIPTION,CLAIMS,ABSTRACT,DRAWINGS,ID_DESCRIPTION,ID_PHOTOS_SET,PRIORITY_DOC,POA,PAYMENT_RECEIPT,TRANSLATION,OTHER',
            'notes' => 'nullable|string',
        ]);

        $file = $this->fileService->storeFile($request->file('file'), $request->user());

        // Mark previous attachments of same type as not current (optional, depending on business rule)
        // For now, we allow multiple, but if we wanted versioning, we'd update here.
        // Let's assume we just append for now, or maybe mark old ones if strictly one per type.
        // Given the requirements (e.g. "Description"), usually there's one active.
        // Let's mark previous ones of same type as not current for simplicity and clarity.
        ApplicationAttachment::where('application_id', $application->id)
            ->where('doc_type', $validated['doc_type'])
            ->update(['is_current' => false]);

        $attachment = ApplicationAttachment::create([
            'application_id' => $application->id,
            'file_id' => $file->id,
            'doc_type' => $validated['doc_type'],
            'is_current' => true,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => new ApplicationAttachmentResource($attachment->load('file'))], 201);
    }

    public function destroy($applicationId, $attachmentId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('update', $application);

        $attachment = ApplicationAttachment::where('application_id', $applicationId)
            ->where('id', $attachmentId)
            ->firstOrFail();

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully.'], 200);
    }

    public function download($applicationId, $attachmentId)
    {
        $application = Application::findOrFail($applicationId);
        $this->authorize('view', $application);

        $attachment = ApplicationAttachment::with('file')
            ->where('application_id', $applicationId)
            ->where('id', $attachmentId)
            ->firstOrFail();

        if (!$attachment->file) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        // Return the file URL for download (frontend will handle the download)
        // If using presigned URLs, generate one here
        return response()->json([
            'data' => [
                'url' => $attachment->file->url,
                'filename' => $attachment->file->filename,
                'mime_type' => $attachment->file->mime,
                'size' => $attachment->file->size_bytes,
            ]
        ]);
    }
}
