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
                'section' => [$section->value], // Wrap single section in array
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

            // Determine if this is a post-grant amendment
            $isPostGrant = $application->status === \App\Enums\ApplicationStatus::GRANTED;

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
                            'is_current' => !$isPostGrant, // Pre-grant: immediately current
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
                ->map(fn($a) => [
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

            // Update amendment with derived sections from changed fields
            $amendment = RequestAmendment::create([
                'request_id' => $request->id,
                'section' => $this->deriveSectionsFromChangedFields($pendingVersion->changed_fields),
                'change_summary' => $changeSummary,
                'pending_version_id' => $pendingVersion->id,
            ]);

            // Generate fee quote based on changes
            $this->generateEditModeFeeQuote($request, $pendingVersion);

            // PRE-GRANT: Auto-apply immediately
            if (!$isPostGrant) {
                // Apply changes immediately
                $this->amendmentVersionService->applyPendingVersion($pendingVersion, $userId);

                // Adjust status based on changes
                $this->adjustStatusForPreGrantAmendment($application, $pendingVersion);

                // Mark request as auto-approved
                $request->update([
                    'status' => \App\Enums\RequestStatus::APPROVED,
                    'request_date' => now()->toDateString(),
                    'processed_by' => $userId,
                    'processed_date' => now()->toDateString(),
                    'processing_notes' => 'Pre-grant amendment auto-applied',
                ]);
            } else {
                // POST-GRANT: Require staff approval
                $request->update([
                    'status' => \App\Enums\RequestStatus::SUBMITTED,
                    'request_date' => now()->toDateString(),
                ]);

                // Set application to UNDER_AMENDMENT
                $application->update([
                    'previous_status' => $application->status,
                    'status' => \App\Enums\ApplicationStatus::UNDER_AMENDMENT,
                ]);
            }

            return $request->load(['amendment', 'amendment.pendingVersion', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Adjust application status after pre-grant amendment is auto-applied.
     *
     * Logic per CLAUDE.md Pre-grant Amendment:
     * - If attachments changed → revert to SUBMITTED (restart formality)
     * - If only parties/admin changed → status remains unchanged
     */
    protected function adjustStatusForPreGrantAmendment(
        Application $application,
        \App\Models\ApplicationPendingVersion $pendingVersion
    ): void {
        $changedFields = $pendingVersion->changed_fields ?? [];
        $attachmentsChanged = in_array('attachments', $changedFields);

        if ($attachmentsChanged) {
            // Restart formality examination per CLAUDE.md
            $application->update(['status' => \App\Enums\ApplicationStatus::SUBMITTED]);
        }
        // Otherwise, status remains unchanged (parties/admin only)
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
                'section' => [$section->value], // Wrap single section in array
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

        // Apply pending version (edit-mode or legacy)
        if ($amendment && $amendment->hasPendingVersion()) {
            $this->amendmentVersionService->applyPendingVersion(
                $amendment->pendingVersion,
                $request->processed_by
            );
        } else if ($amendment) {
            // Legacy form-based amendment
            $docType = $this->sectionToDocType($amendment->section);
            if ($docType) {
                $application->attachments()
                    ->where('doc_type', $docType)
                    ->whereNull('request_id')
                    ->update(['is_current' => false]);
                $request->attachments()
                    ->where('doc_type', $docType)
                    ->update(['is_current' => true]);
            }
        }

        // Create version snapshot
        $this->versioningService->createVersionFromAmendment(
            $application,
            $request,
            $request->processed_by
        );

        // Restore status (post-grant only)
        $this->restoreApplicationStatus($application);
    }

    /**
     * Handle rejection of an amendment.
     * For edit-mode amendments, discard the pending version.
     */
    protected function applyRefusalChanges(ApplicationRequest $request): void
    {
        $amendment = $request->amendment;
        $application = $request->application;

        // Discard pending version
        if ($amendment && $amendment->hasPendingVersion()) {
            $this->amendmentVersionService->discardPendingVersion($amendment->pendingVersion);
        }

        // Restore to GRANTED (post-grant refusals)
        if ($application->previous_status === \App\Enums\ApplicationStatus::GRANTED) {
            $application->update([
                'status' => \App\Enums\ApplicationStatus::GRANTED,
                'previous_status' => null,
            ]);
        }
    }

    /**
     * Restore application status after POST-GRANT amendment approval.
     * Post-grant amendments always return to GRANTED.
     */
    protected function restoreApplicationStatus(Application $application): void
    {
        if ($application->previous_status === \App\Enums\ApplicationStatus::GRANTED) {
            $application->update([
                'status' => \App\Enums\ApplicationStatus::GRANTED,
                'previous_status' => null,
            ]);
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

    /**
     * Derive affected sections from changed field names.
     * Maps field names to their corresponding amendment sections.
     */
    private function deriveSectionsFromChangedFields(array $changedFields): array
    {
        $sectionMap = [
            'title' => 'BASIC_INFO',
            'applicant_is_inventor' => 'BASIC_INFO',
            'publication_early_requested' => 'BASIC_INFO',
            'pub_delay_months' => 'BASIC_INFO',
            'parties' => 'PARTIES',
            'attachments' => 'DOCUMENTS',
            'priority_claims' => 'PRIORITY',
            'ipc_classes' => 'CLASSIFICATION',
            'locarno_classes' => 'CLASSIFICATION',
            'metrics' => 'METRICS',
        ];

        $sections = [];
        foreach ($changedFields as $field) {
            if (isset($sectionMap[$field])) {
                $sections[] = $sectionMap[$field];
            }
        }

        // Remove duplicates and return
        return array_values(array_unique($sections));
    }
}
