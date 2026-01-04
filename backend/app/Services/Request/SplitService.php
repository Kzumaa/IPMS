<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\SplitInfo;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SplitService extends BaseRequestService
{
    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::SPLIT;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-SPLIT';
    }

    /**
     * Validate that application can be split.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Cannot split if already granted or declined
        if (in_array($application->status, [ApplicationStatus::GRANTED, ApplicationStatus::DECLINED])) {
            throw ValidationException::withMessages([
                'application' => 'Cannot split an application that has been granted or declined.',
            ]);
        }
    }

    /**
     * Create a new split request.
     */
    public function createSplit(
        Application $application,
        int $userId,
        string $splitDescription
    ): ApplicationRequest {
        return DB::transaction(function () use ($application, $userId, $splitDescription) {
            $request = $this->createRequest($application, $userId, [
                'processing_notes' => $splitDescription, // Store split description in processing_notes for now
            ]);

            $this->generateFeeQuote($request);

            return $request->load(['feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when split is approved.
     * Creates a new child application linked to the parent.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $parent = $request->application;

        // Create child application
        $child = Application::create([
            'app_type' => $parent->app_type,
            'title' => $parent->title . ' (Split)',
            'status' => ApplicationStatus::DRAFT,
            'applicant_is_inventor' => $parent->applicant_is_inventor,
            'publication_early_requested' => $parent->publication_early_requested,
            'created_by' => $request->created_by,
        ]);

        // Create split_info record
        SplitInfo::create([
            'application_id' => $child->id,
            'parent_app_no' => $parent->app_no,
            'parent_filing_date' => $parent->filing_date,
            'parent_internal_id' => $parent->id,
        ]);

        // Copy parties from parent to child
        foreach ($parent->activeParties as $party) {
            $child->parties()->create([
                'role' => $party->role,
                'user_id' => $party->user_id,
                'snapshot_name' => $party->snapshot_name,
                'snapshot_address' => $party->snapshot_address,
                'snapshot_email' => $party->snapshot_email,
                'nationality' => $party->nationality,
                'is_primary' => $party->is_primary,
                'valid_from' => now()->toDateString(),
            ]);
        }

        // Copy priority claims
        foreach ($parent->priorityClaims as $claim) {
            $child->priorityClaims()->create([
                'kind' => $claim->kind,
                'number' => $claim->number,
                'filing_date' => $claim->filing_date,
                'country_code' => $claim->country_code,
                'agreement_name' => $claim->agreement_name,
            ]);
        }

        // Update request with reference to child
        $request->update([
            'processing_notes' => ($request->processing_notes ?? '') . "\nChild application created: ID {$child->id}",
        ]);
    }

    /**
     * Delete a draft split request.
     */
    public function deleteSplit(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft split requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            return $request->delete();
        });
    }
}
