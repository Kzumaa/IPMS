<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AppType;
use App\Enums\ApplicationStatus;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\FeeQuote;
use App\Models\ProtectionTitle;
use App\Models\RequestRenewal;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RenewalService extends BaseRequestService
{
    /**
     * Maximum number of renewals allowed for Industrial Designs.
     * Each renewal is 5 years, so max 2 renewals = 15 years total.
     */
    private const MAX_ID_RENEWALS = 2;

    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::RENEWAL;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'REQ-RENEWAL';
    }

    /**
     * Override validation to check application status and renewal eligibility.
     *
     * Vietnam IP Law:
     * - Patents: Cannot be renewed (fixed 20 years, use maintenance fees)
     * - Utility Solutions: Cannot be renewed (fixed 10 years, use maintenance fees)
     * - Industrial Designs: Can be renewed twice (5 years each, max 15 years total)
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Application must be GRANTED to renew
        if ($application->status !== ApplicationStatus::GRANTED) {
            throw ValidationException::withMessages([
                'application' => 'Only granted applications can be renewed.',
            ]);
        }

        // Validation is done in validateCanCreateRequest
        // $protectionTitle check removed as we use Application->expiry_date now

        // Only Industrial Designs can be renewed
        if ($application->app_type !== AppType::INDUSTRIAL_DESIGN) {
            throw ValidationException::withMessages([
                'application' => 'Only Industrial Designs can be renewed. Patents and Utility Solutions have fixed terms with annual maintenance fees.',
            ]);
        }

        // Check renewal count (max 2 renewals for ID)
        $existingRenewals = $application->requests()
            ->where('type', RequestType::RENEWAL)
            ->where('status', RequestStatus::APPROVED)
            ->count();

        if ($existingRenewals >= self::MAX_ID_RENEWALS) {
            throw ValidationException::withMessages([
                'application' => 'Industrial Designs can only be renewed twice (maximum 15 years total protection).',
            ]);
        }

        // Check if there's already a pending renewal request
        $pendingRenewal = $application->requests()
            ->where('type', RequestType::RENEWAL)
            ->whereIn('status', [RequestStatus::DRAFT, RequestStatus::SUBMITTED, RequestStatus::EXAMINING])
            ->exists();

        if ($pendingRenewal) {
            throw ValidationException::withMessages([
                'application' => 'There is already a pending renewal request for this application.',
            ]);
        }
    }

    /**
     * Get remaining renewals count for an application.
     */
    public function getRemainingRenewals(Application $application): int
    {
        if ($application->app_type !== AppType::INDUSTRIAL_DESIGN) {
            return 0;
        }

        $usedRenewals = $application->requests()
            ->where('type', RequestType::RENEWAL)
            ->where('status', RequestStatus::APPROVED)
            ->count();

        return max(0, self::MAX_ID_RENEWALS - $usedRenewals);
    }

    /**
     * Create a new renewal request.
     *
     * For Industrial Designs, renewal is always 5 years.
     */
    public function createRenewal(
        Application $application,
        int $userId
    ): ApplicationRequest {
        // Validation is done in validateCanCreateRequest
        $this->validateCanCreateRequest($application);

        // Industrial Designs always renew for 5 years
        $renewalYears = 5;

        // Use Application expiry date
        $currentExpiration = $application->expiry_date 
            ? \Carbon\Carbon::parse($application->expiry_date) 
            : now(); // Fallback if missing, though should be set on grant
            
        $newExpiration = $currentExpiration->copy()->addYears($renewalYears);

        return DB::transaction(function () use ($application, $userId, $renewalYears, $currentExpiration, $newExpiration) {
            $request = $this->createRequest($application, $userId);

            RequestRenewal::create([
                'request_id' => $request->id,
                'renewal_years' => $renewalYears,
                'current_expiration_date' => $currentExpiration->toDateString(),
                'new_expiration_date' => $newExpiration->toDateString(),
            ]);

            $this->generateFeeQuote($request);

            return $request->load(['renewal', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when renewal is approved.
     */
    /**
     * Generate fee quote for this request.
     * Override to calculate fee based on Locarno classes count.
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

        // Count Locarno classes
        $classCount = $application->locarnoClasses()->count();
        if ($classCount === 0) {
            // Fallback to 1 if no classes defined (should rarely happen for ID)
            $classCount = 1;
        }

        // Calculate total amount: Unit Price * Class Count
        // SRS 5.3: "Renewal: 100,000 / Option (Class)"
        $totalAmount = $feeCatalog->unit_price * $classCount;

        // Get next version for this application
        $nextVersion = FeeQuote::where('application_id', $application->id)->max('version') + 1;

        return DB::transaction(function () use ($request, $application, $feeCatalog, $nextVersion, $lawVersion, $classCount, $totalAmount) {
            // Create fee quote
            $feeQuote = FeeQuote::create([
                'application_id' => $application->id,
                'request_id' => $request->id,
                'version' => $nextVersion,
                'currency' => 'VND',
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'law_version' => $lawVersion,
            ]);

            // Create fee quote line
            $feeQuote->lines()->create([
                'fee_code' => $feeCatalog->code,
                'label' => "{$feeCatalog->label} ({$classCount} Class/Option" . ($classCount > 1 ? 's' : '') . ")",
                'units' => $classCount,
                'unit_price' => $feeCatalog->unit_price,
                'amount' => $totalAmount,
                'source' => 'AUTO',
            ]);

            return $feeQuote;
        });
    }

    /**
     * Auto-approve renewal after successful payment.
     */
    public function approveRenewalAfterPayment(ApplicationRequest $request): void
    {
        if ($request->type !== RequestType::RENEWAL) {
            return;
        }

        DB::transaction(function () use ($request) {
            // Set status to APPROVED
            $updatedRequest = $this->requestRepository->update($request, [
                'status' => RequestStatus::APPROVED,
                'processed_date' => now()->toDateString(),
                'processing_notes' => 'Auto-approved after payment',
            ]);

            // Apply extension logic
            $this->applyApprovalChanges($updatedRequest);
        });
    }

    /**
     * Apply changes when renewal is approved.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $renewal = $request->renewal;
        $application = $request->application;

        if ($renewal) {
            // Update the application expiry date directly
            $application->update([
                'expiry_date' => $renewal->new_expiration_date,
            ]);
        }
    }

    /**
     * Delete a draft renewal request.
     */
    public function deleteRenewal(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft renewal requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->renewal()->delete();

            return $request->delete();
        });
    }
}
