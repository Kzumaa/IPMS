<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\AppType;
use App\Enums\ApplicationStatus;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationRequest;
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

        // Check if there's a protection title
        $protectionTitle = $application->protectionTitle;
        if (!$protectionTitle) {
            throw ValidationException::withMessages([
                'application' => 'No protection title found for this application.',
            ]);
        }

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

        $protectionTitle = $application->protectionTitle;

        if (!$protectionTitle) {
            throw ValidationException::withMessages([
                'application' => 'No protection title found for this application.',
            ]);
        }

        // Industrial Designs always renew for 5 years
        $renewalYears = 5;

        $currentExpiration = Carbon::parse($protectionTitle->expiry_date);
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
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $renewal = $request->renewal;
        $application = $request->application;
        $protectionTitle = $application->protectionTitle;

        if ($protectionTitle && $renewal) {
            // Update the protection title expiry date
            $protectionTitle->update([
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
