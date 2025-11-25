<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
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

        return response()->json($attachment->load('file'), 201);
    }
}
