<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AmendmentSection;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationAttachment;
use App\Models\ApplicationRequest;
use App\Models\RequestAmendment;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use App\Services\Application\AmendmentVersionService;
use App\Services\Application\VersioningService;
use App\Services\File\FileService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AmendmentService extends BaseRequestService
{
    protected VersioningService $versioningService;
    protected AmendmentVersionService $amendmentVersionService;
    protected FileService $fileService;

    public function __construct(
        ApplicationRequestRepositoryInterface $requestRepository,
        VersioningService $versioningService,
        AmendmentVersionService $amendmentVersionService,
        FileService $fileService
    ) {
        parent::__construct($requestRepository);
        $this->versioningService = $versioningService;
        $this->amendmentVersionService = $amendmentVersionService;
        $this->fileService = $fileService;
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::AMENDMENT;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-AMEND';
    }

    /**
     * Create a new amendment request (legacy form-based).
     */
    public function createAmendment(
        Application $application,
        int $userId,
        AmendmentSection $section,
        string $changeSummary,
        ?string $fieldName = null,
        ?string $oldValue = null,
        ?string $newValue = null
    ): ApplicationRequest {
        return DB::transaction(function () use ($application, $userId, $section, $changeSummary, $fieldName, $oldValue, $newValue) {
            // Create parent request
            $request = $this->createRequest($application, $userId);

            // Create amendment details
            RequestAmendment::create([
                'request_id' => $request->id,
                'section' => $section,
                'change_summary' => $changeSummary,
                'field_name' => $fieldName,
                'old_value' => $oldValue,
                'new_value' => $newValue,
            ]);

            // Generate fee quote
            $this->generateFeeQuote($request);

            return $request->load(['amendment', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Create an edit-mode amendment with proposed changes.
     * This creates a pending version with full field-level tracking.
     */
    public function createEditModeAmendment(
        Application $application,
        int $userId,
        array $proposedData,
        string $changeSummary,
        array $uploadedFiles = [],
        array $removedAttachmentIds = []
    ): ApplicationRequest {
        return DB::transaction(function () use ($application, $userId, $proposedData, $changeSummary, $uploadedFiles, $removedAttachmentIds) {
            // Create parent request
            $request = $this->createRequest($application, $userId);

            // Create amendment details (section will be MULTIPLE for edit-mode)
            $amendment = RequestAmendment::create([
                'request_id' => $request->id,
                'section' => AmendmentSection::BIBLIOGRAPHY, // Default, actual changes tracked in pending version
                'change_summary' => $changeSummary,
            ]);

            // Store uploaded files as request attachments using FileService (uploads to R2)
            $newAttachmentSnapshots = [];
            $uploader = Auth::user();

            if (!empty($uploadedFiles)) {
                foreach ($uploadedFiles as $item) {
                    if (isset($item['file']) && $item['file']->isValid()) {
                        $uploadedFile = $item['file'];
                        $docType = $item['doc_type'] ?? 'OTHER';

                        // Upload file to R2 using FileService
                        $file = $this->fileService->storeFile($uploadedFile, $uploader);

                        // Create attachment record linked to request
                        $attachment = ApplicationAttachment::create([
                            'application_id' => $application->id,
                            'request_id' => $request->id,
                            'file_id' => $file->id,
                            'doc_type' => $docType,
                            'is_current' => false, // Will become current on approval
                        ]);

                        // Add to snapshots for change tracking
                        $newAttachmentSnapshots[] = [
                            'id' => $attachment->id,
                            'doc_type' => $docType,
                            'original_filename' => $file->filename,
                            'file_id' => $file->id,
                            'page_count' => null, // Can be updated later
                            'is_new' => true,
                        ];
                    }
                }
            }

            // Update proposedData with attachment changes info
            $currentAttachments = $application->attachments()
                ->with('file')
                ->where('is_current', true)
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'doc_type' => $a->doc_type,
                    'file_id' => $a->file_id,
                    'original_filename' => $a->file?->filename ?? $a->original_filename,
                    'page_count' => $a->page_count,
                ])
                ->toArray();

            // Filter out removed attachments and add new ones
            $proposedAttachments = array_filter($currentAttachments, function ($att) use ($removedAttachmentIds) {
                return !in_array($att['id'], $removedAttachmentIds);
            });
            $proposedAttachments = array_merge(array_values($proposedAttachments), $newAttachmentSnapshots);
            $proposedData['attachments'] = $proposedAttachments;

            // Store metadata about attachment changes
            $proposedData['_attachment_changes'] = [
                'new_attachment_ids' => array_column($newAttachmentSnapshots, 'id'),
                'removed_attachment_ids' => $removedAttachmentIds,
            ];

            // Create pending version with change tracking
            $pendingVersion = $this->amendmentVersionService->createPendingVersion(
                $application,
                $request,
                $proposedData,
                $userId
            );

            // Generate fee quote based on changes
            $this->generateEditModeFeeQuote($request, $pendingVersion);

            return $request->load(['amendment', 'amendment.pendingVersion', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Generate fee quote for edit-mode amendment based on changes.
     */
    protected function generateEditModeFeeQuote(
        ApplicationRequest $request,
        \App\Models\ApplicationPendingVersion $pendingVersion
    ): void {
        // For now, use the standard amendment fee
        // In the future, this could calculate fees based on the number/type of changes
        $this->generateFeeQuote($request);

        // Additional fee logic based on changes could be added here:
        // - More changes = higher fee
        // - Document changes = document fee
        // - Party changes = party modification fee
    }

    /**
     * Update an amendment request (only if still in DRAFT status).
     */
    public function updateAmendment(
        ApplicationRequest $request,
        AmendmentSection $section,
        string $changeSummary,
        ?string $fieldName = null,
        ?string $oldValue = null,
        ?string $newValue = null
    ): ApplicationRequest {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Amendment request cannot be edited in its current state.',
            ]);
        }

        return DB::transaction(function () use ($request, $section, $changeSummary, $fieldName, $oldValue, $newValue) {
            // Update amendment details
            $request->amendment->update([
                'section' => $section,
                'change_summary' => $changeSummary,
                'field_name' => $fieldName,
                'old_value' => $oldValue,
                'new_value' => $newValue,
            ]);

            return $request->load(['amendment', 'feeQuote', 'feeQuote.lines', 'attachments']);
        });
    }

    /**
     * Apply changes when amendment is approved.
     * This updates attachments and creates a new application version.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $amendment = $request->amendment;
        $application = $request->application;

        // Check if this is an edit-mode amendment with pending version
        if ($amendment && $amendment->hasPendingVersion()) {
            // Apply the pending version changes
            $this->amendmentVersionService->applyPendingVersion(
                $amendment->pendingVersion,
                $request->processed_by
            );
            return;
        }

        // Legacy form-based amendment handling
        if ($amendment) {
            // Get doc_type based on section
            $docType = $this->sectionToDocType($amendment->section);

            if ($docType) {
                // Mark old attachments of this type as not current
                $application->attachments()
                    ->where('doc_type', $docType)
                    ->whereNull('request_id')
                    ->update(['is_current' => false]);

                // Mark new attachments from this request as current
                $request->attachments()
                    ->where('doc_type', $docType)
                    ->update(['is_current' => true]);
            }
        }

        // Create a new version snapshot after the amendment is applied
        $this->versioningService->createVersionFromAmendment(
            $application,
            $request,
            $request->processed_by
        );
    }

    /**
     * Handle rejection of an amendment.
     * For edit-mode amendments, discard the pending version.
     */
    protected function applyRefusalChanges(ApplicationRequest $request): void
    {
        $amendment = $request->amendment;

        // If this is an edit-mode amendment, discard the pending version
        if ($amendment && $amendment->hasPendingVersion()) {
            $this->amendmentVersionService->discardPendingVersion($amendment->pendingVersion);
        }
    }

    /**
     * Map amendment section to document type.
     */
    private function sectionToDocType(AmendmentSection $section): ?string
    {
        return match ($section) {
            AmendmentSection::SPECIFICATION => 'DESCRIPTION',
            AmendmentSection::CLAIMS => 'CLAIMS',
            AmendmentSection::DRAWINGS => 'DRAWINGS',
            default => null,
        };
    }

    /**
     * Delete a draft amendment request.
     */
    public function deleteAmendment(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft amendment requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            // Delete attachments first
            $request->attachments()->delete();

            // Delete fee quote
            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            // Delete amendment details
            $request->amendment()->delete();

            // Delete request
            return $request->delete();
        });
    }
}
