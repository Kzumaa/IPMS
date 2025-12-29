<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AmendmentSection;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\RequestAmendment;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AmendmentService extends BaseRequestService
{
    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
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
     * Create a new amendment request.
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
     * This could update the application's attachments or other data.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        // When amendment is approved, the new documents attached to this request
        // become the current documents, and old documents are marked as is_current = false.
        $amendment = $request->amendment;

        if (!$amendment) {
            return;
        }

        // Get doc_type based on section
        $docType = $this->sectionToDocType($amendment->section);

        if ($docType) {
            $application = $request->application;

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
