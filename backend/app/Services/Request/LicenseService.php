<?php

declare(strict_types=1);

namespace App\Services\Request;

use App\Enums\ApplicationStatus;
use App\Enums\LicenseType;
use App\Enums\RequestType;
use App\Models\Application;
use App\Models\ApplicationParty;
use App\Models\ApplicationRequest;
use App\Models\FeeQuote;
use App\Models\RequestLicense;
use App\Models\User;
use App\Repositories\Request\ApplicationRequestRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LicenseService extends BaseRequestService
{
    public function __construct(ApplicationRequestRepositoryInterface $requestRepository)
    {
        parent::__construct($requestRepository);
    }

    protected function getRequestType(): RequestType
    {
        return RequestType::LICENSE;
    }

    protected function getFeeCodeSuffix(): string
    {
        return 'LICENSE'; // Used as prefix for fee lookup
    }

    /**
     * Validate that a license request can be created.
     * License can only be created for GRANTED applications.
     */
    protected function validateCanCreateRequest(Application $application): void
    {
        parent::validateCanCreateRequest($application);

        // Application must be GRANTED to create a license
        if ($application->status !== ApplicationStatus::GRANTED) {
            throw ValidationException::withMessages([
                'application' => 'License requests can only be created for granted applications.',
            ]);
        }
    }

    /**
     * Generate fee quote with multiple license fee components.
     * Total: 590,000 VND (120k + 230k + 120k + 120k)
     */
    public function generateFeeQuote(ApplicationRequest $request, string $lawVersion = 'TT263-2016'): FeeQuote
    {
        $application = $request->application;

        // Get app type prefix
        $prefix = match ($application->app_type->value) {
            'PATENT' => 'PAT',
            'UTILITY' => 'UTL',
            'INDUSTRIAL_DESIGN' => 'ID',
            default => 'PAT',
        };

        // Fee codes for license
        $feeCodes = [
            "{$prefix}-LICENSE-CERT",  // Certificate fee
            "{$prefix}-LICENSE-EXAM",  // Examination fee
            "{$prefix}-LICENSE-PUB",   // Publication fee
            "{$prefix}-LICENSE-REG",   // Registration fee
        ];

        // Get all fees from catalog
        $fees = DB::table('fee_catalog')
            ->whereIn('code', $feeCodes)
            ->where('law_version', $lawVersion)
            ->get()
            ->keyBy('code');

        if ($fees->count() !== 4) {
            throw ValidationException::withMessages([
                'fee' => 'License fee codes not found in catalog.',
            ]);
        }

        // Calculate total
        $totalAmount = $fees->sum('unit_price');

        // Get next version for this application
        $nextVersion = FeeQuote::where('application_id', $application->id)->max('version') + 1;

        return DB::transaction(function () use ($request, $application, $fees, $feeCodes, $totalAmount, $nextVersion, $lawVersion) {
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

            // Create fee quote lines for each component
            foreach ($feeCodes as $code) {
                $fee = $fees[$code];
                $feeQuote->lines()->create([
                    'fee_code' => $fee->code,
                    'label' => $fee->label,
                    'units' => 1,
                    'unit_price' => $fee->unit_price,
                    'amount' => $fee->unit_price,
                    'source' => 'AUTO',
                ]);
            }

            return $feeQuote;
        });
    }

    /**
     * Create a new license request.
     */
    public function createLicense(
        Application $application,
        int $userId,
        int $licensorUserId,
        int $licenseeUserId,
        LicenseType $licenseType,
        Carbon $validFrom,
        Carbon $validTo,
        string $scopeTerritory = 'VN',
        ?string $scopeProducts = null,
        ?string $contractNumber = null
    ): ApplicationRequest {
        // Validate licensor is current owner
        $currentOwner = $application->activeParties()
            ->where('role', 'APPLICANT')
            ->where('user_id', $licensorUserId)
            ->first();

        if (!$currentOwner) {
            throw ValidationException::withMessages([
                'licensor' => 'Licensor must be a current applicant of the application.',
            ]);
        }

        // Validate licensee exists
        $licensee = User::find($licenseeUserId);
        if (!$licensee) {
            throw ValidationException::withMessages([
                'licensee' => 'Licensee user not found.',
            ]);
        }

        // Validate license duration
        if ($validTo->lte($validFrom)) {
            throw ValidationException::withMessages([
                'valid_to' => 'License end date must be after start date.',
            ]);
        }

        // TODO: Validate license duration doesn't exceed protection title expiry
        // $protectionTitle = $application->protectionTitle;
        // if ($protectionTitle && $validTo->gt($protectionTitle->expiry_date)) {
        //     throw ValidationException::withMessages([
        //         'valid_to' => 'License cannot extend beyond protection title expiry date.',
        //     ]);
        // }

        return DB::transaction(function () use ($application, $userId, $licensorUserId, $licenseeUserId, $licenseType, $validFrom, $validTo, $scopeTerritory, $scopeProducts, $contractNumber) {
            $request = $this->createRequest($application, $userId);

            RequestLicense::create([
                'request_id' => $request->id,
                'licensor_user_id' => $licensorUserId,
                'licensee_user_id' => $licenseeUserId,
                'license_type' => $licenseType,
                'scope_territory' => $scopeTerritory,
                'scope_products' => $scopeProducts,
                'valid_from' => $validFrom,
                'valid_to' => $validTo,
                'contract_number' => $contractNumber,
            ]);

            $this->generateFeeQuote($request);

            return $request->load(['license', 'license.licensor', 'license.licensee', 'feeQuote', 'feeQuote.lines']);
        });
    }

    /**
     * Apply changes when license is approved.
     * Adds licensee as a party to the application.
     */
    protected function applyApprovalChanges(ApplicationRequest $request): void
    {
        $license = $request->license;

        if (!$license) {
            return;
        }

        $application = $request->application;
        $licensee = User::find($license->licensee_user_id);

        // Add licensee as a party
        ApplicationParty::create([
            'application_id' => $application->id,
            'role' => 'LICENSEE',
            'user_id' => $license->licensee_user_id,
            'is_primary' => false,
            'snapshot_name' => $licensee->name,
            'snapshot_email' => $licensee->email,
            'valid_from' => $license->valid_from,
            'valid_to' => $license->valid_to,
            'source_request_id' => $request->id,
        ]);
    }

    /**
     * Delete a draft license request.
     */
    public function deleteLicense(ApplicationRequest $request): bool
    {
        if (!$request->canEdit()) {
            throw ValidationException::withMessages([
                'request' => 'Only draft license requests can be deleted.',
            ]);
        }

        return DB::transaction(function () use ($request) {
            $request->attachments()->delete();

            if ($request->feeQuote) {
                $request->feeQuote->lines()->delete();
                $request->feeQuote->delete();
            }

            $request->license()->delete();

            return $request->delete();
        });
    }
}
