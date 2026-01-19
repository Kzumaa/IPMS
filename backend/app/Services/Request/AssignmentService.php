<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\RequestType;
use App\Enums\TransferType;
use App\Models\Application;
use App\Models\ApplicationParty;
use App\Models\ApplicationRequest;
use App\Models\RequestAssignment;
use App\Models\User;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssignmentService extends BaseRequestService
{
    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::ASSIGNMENT;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-ASSIGN';
    }

    /**
     * Create a new assignment/transfer request.
     */
    public function createAssignment(
        Application $application,
        int $userId,
        int $assignorUserId,
        int $assigneeUserId,
        TransferType $transferType,
        ?string $contractNumber = null,
        ?Carbon $contractDate = null
    ): ApplicationRequest {
        // Validate assignor is current owner
        $currentOwner = $application->activeParties()
            ->where('role', 'APPLICANT')
            ->where('user_id', $assignorUserId)
            ->first();

        if (!$currentOwner) {
            throw ValidationException::withMessages([
                'assignor' => 'Assignor must be a current applicant of the application.',
            ]);
        }

        // Validate assignee exists
        $assignee = User::find($assigneeUserId);
        if (!$assignee) {
            throw ValidationException::withMessages([
                'assignee' => 'Assignee user not found.',
            ]);
        }

        return DB::transaction(function () use ($application, $userId, $assignorUserId, $assigneeUserId, $transferType, $contractNumber, $contractDate) {
            // Create parent request
            $request = $this->createRequest($application, $userId);

            // Create assignment details
            RequestAssignment::create([
                'request_id' => $request->id,
                'assignor_user_id' => $assignorUserId,
                'assignee_user_id' => $assigneeUserId,
                'transfer_type' => $transferType,
                'contract_number' => $contractNumber,
                'contract_date' => $contractDate,
            ]);

            // Generate fee quote
            $this->generateFeeQuote($request);

            return $request->load(['assignment', 'assignment.assignor', 'assignment.assignee', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when assignment is approved.
     * Transfers ownership from assignor to assignee.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $assignment = $request->assignment;

        if (!$assignment) {
            return;
        }

        $application = $request->application;
        $now = now()->toDateString();

        // Find and soft-delete the old party record
        $oldParty = $application->activeParties()
            ->where('role', 'APPLICANT')
            ->where('user_id', $assignment->assignor_user_id)
            ->first();

        if ($oldParty) {
            $oldParty->update(['valid_to' => $now]);
        }

        // Create new party record for the assignee
        $assignee = User::find($assignment->assignee_user_id);

        ApplicationParty::create([
            'application_id' => $application->id,
            'role' => 'APPLICANT',
            'user_id' => $assignment->assignee_user_id,
            'is_primary' => $oldParty?->is_primary ?? true,
            'snapshot_name' => $assignee->name,
            'snapshot_email' => $assignee->email,
            'valid_from' => $now,
            'source_request_id' => $request->id,
        ]);
    }

    /**
     * Delete a draft assignment request.
     */
    public function deleteAssignment(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft assignment requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->assignment()->delete();

            return $request->delete();
        });
    }
}
