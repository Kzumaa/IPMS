<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\FeeQuote;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

abstract class BaseRequestService
{
    protected ApplicationRequestRepositoryInterface $requestRepository;

    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        $this->requestRepository = $requestRepository;
    }

    /**
     * Get the request type handled by this service.
     */
    abstract protected function getRequestType(): RequestType;

    /**
     * Get the fee code for this request type (without app type prefix).
     */
    abstract protected function getFeeCodeSuffix(): string;

    /**
     * Validate that a request can be created for this application.
     *
     * @throws ValidationException
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        // Rule 1: Application must not be in DRAFT status
        if ($application->status === ApplicationStatus::DRAFT) {
            throw ValidationException::withMessages([
                'application' => 'Cannot create request for draft applications. Submit the application first.',
            ]);
        }

        // Rule 2: No active (pending) request of the same type
        if ($this->requestRepository->hasPendingOfType($application, $this->getRequestType())) {
            throw ValidationException::withMessages([
                'request' => "An active {$this->getRequestType()->value} request already exists for this application.",
            ]);
        }
    }

    /**
     * Create a new request in DRAFT status.
     */
    protected function createRequest(Application $application, int $userId, array $additionalData = []): ApplicationRequest
    {
        $this->validateCanCreateRequest($application);

        return $this->requestRepository->create(array_merge([
            'application_id' => $application->id,
            'type' => $this->getRequestType(),
            'status' => RequestStatus::DRAFT,
            'created_by' => $userId,
        ], $additionalData));
    }

    /**
     * Submit a request (transition from DRAFT to SUBMITTED).
     *
     * @throws ValidationException
     */
    public function submitRequest(ApplicationRequest $request): ApplicationRequest
    {
        if (!$request->canSubmit()) {
            throw ValidationException::withMessages([
                'request' => 'Request cannot be submitted in its current state.',
            ]);
        }

        // Validate fee quote exists and is pending
        if (!$request->feeQuote) {
            throw ValidationException::withMessages([
                'fee' => 'Fee quote must be generated before submission.',
            ]);
        }

        return $this->requestRepository->update($request, [
            'status' => RequestStatus::SUBMITTED,
            'request_date' => now()->toDateString(),
        ]);
    }

    /**
     * Process approval of a request (staff action).
     */
    public function approveRequest(ApplicationRequest $request, int $staffId, ?string $notes = null): ApplicationRequest
    {
        return DB::transaction(function () use ($request, $staffId, $notes) {
            // Update request status
            $updatedRequest = $this->requestRepository->update($request, [
                'status' => RequestStatus::APPROVED,
                'processed_date' => now()->toDateString(),
                'processed_by' => $staffId,
                'processing_notes' => $notes,
            ]);

            // Apply the changes specific to this request type
            $this->applyApprovalChanges($updatedRequest);

            return $updatedRequest;
        });
    }

    /**
     * Apply changes when request is approved. Override in child classes.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        // Default: no action. Child classes override this.
    }

    /**
     * Process refusal of a request (staff action).
     */
    public function refuseRequest(ApplicationRequest $request, int $staffId, ?string $notes = null): ApplicationRequest
    {
        return $this->requestRepository->update($request, [
            'status' => RequestStatus::REFUSED,
            'processed_date' => now()->toDateString(),
            'processed_by' => $staffId,
            'processing_notes' => $notes,
        ]);
    }

    /**
     * Get the fee code for this request based on application type.
     */
    protected function getFeeCode(Application $application): string
    {
        $prefix = match ($application->app_type->value) {
            'PATENT' => 'PAT',
            'UTILITY' => 'UTL',
            'INDUSTRIAL_DESIGN' => 'ID',
            default => 'PAT',
        };

        return "{$prefix}-{$this->getFeeCodeSuffix()}";
    }

    /**
     * Generate fee quote for this request.
     */
    public function generateFeeQuote(ApplicationRequest $request, string $lawVersion = 'TT263-2016'): FeeQuote
    {
        $application = $request->application;
        $feeCode = $this->getFeeCode($application);

        // Get fee from catalog
        $feeCatalog = DB::table('fee_catalog')
            ->where('code', $feeCode)
            ->where('law_version', $lawVersion)
            ->first();

        if (!$feeCatalog) {
            throw ValidationException::withMessages([
                'fee' => "Fee code {$feeCode} not found in catalog.",
            ]);
        }

        // Get next version for this application
        $nextVersion = FeeQuote::where('application_id', $application->id)->max('version') + 1;

        return DB::transaction(function () use ($request, $application, $feeCatalog, $nextVersion, $lawVersion) {
            // Create fee quote
            $feeQuote = FeeQuote::create([
                'application_id' => $application->id,
                'request_id' => $request->id,
                'version' => $nextVersion,
                'currency' => 'VND',
                'total_amount' => $feeCatalog->unit_price,
                'status' => 'PENDING',
                'law_version' => $lawVersion,
            ]);

            // Create fee quote line
            $feeQuote->lines()->create([
                'fee_code' => $feeCatalog->code,
                'label' => $feeCatalog->label,
                'units' => 1,
                'unit_price' => $feeCatalog->unit_price,
                'amount' => $feeCatalog->unit_price,
                'source' => 'AUTO',
            ]);

            return $feeQuote;
        });
    }

    /**
     * Find a request by ID.
     */
    public function find(int $id): ?ApplicationRequest
    {
        return $this->requestRepository->find($id);
    }

    /**
     * Find a request with all details loaded.
     */
    public function findWithDetails(int $id): ?ApplicationRequest
    {
        return $this->requestRepository->findWithDetails($id);
    }

    /**
     * Get all requests for an application.
     */
    public function getByApplication(Application $application): \Illuminate\Database\Eloquent\Collection
    {
        return $this->requestRepository->findByApplicationId($application->id);
    }
}
