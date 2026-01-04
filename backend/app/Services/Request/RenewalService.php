<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
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
     * Override validation to check application status.
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
    }

    /**
     * Create a new renewal request.
     */
    public function createRenewal(
        Application $application,
        int $userId,
        int $renewalYears = 1
    ): ApplicationRequest {
        $protectionTitle = $application->protectionTitle;

        if (!$protectionTitle) {
            throw ValidationException::withMessages([
                'application' => 'No protection title found for this application.',
            ]);
        }

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
