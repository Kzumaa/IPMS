<?php

namespace App\Services\Application;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ApplicationMetric;
use App\Models\ApplicationParty;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\ApplicationMetric\ApplicationMetricRepositoryInterface;
use App\Repositories\ApplicationParty\ApplicationPartyRepositoryInterface;
use App\Services\Assignment\AssignmentService;
use App\Services\Fee\QuoteGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ApplicationService
{
    protected $assignmentService;
    protected $quoteGenerator;
    protected $applicationRepository;
    protected $applicationMetricRepository;
    protected $applicationPartyRepository;

    public function __construct(
        AssignmentService $assignmentService,
        QuoteGenerator $quoteGenerator,
        ApplicationRepositoryInterface $applicationRepository,
        ApplicationMetricRepositoryInterface $applicationMetricRepository,
        ApplicationPartyRepositoryInterface $applicationPartyRepository
    ) {
        $this->assignmentService = $assignmentService;
        $this->quoteGenerator = $quoteGenerator;
        $this->applicationRepository = $applicationRepository;
        $this->applicationMetricRepository = $applicationMetricRepository;
        $this->applicationPartyRepository = $applicationPartyRepository;
    }
    public function createApplication(array $data): Application
    {
        return DB::transaction(function () use ($data) {
            $user = Auth::user();

            $application = $this->applicationRepository->create([
                'app_type' => $data['app_type'],
                'title' => $data['title'],
                'status' => 'DRAFT',
                'created_by' => $user->id,
                'applicant_is_inventor' => $data['applicant_is_inventor'] ?? false,
                'publication_early_requested' => $data['publication_early_requested'] ?? false,
                'pub_delay_months' => $data['pub_delay_months'] ?? null,
            ]);

            // Create default metrics
            $this->applicationMetricRepository->create([
                'application_id' => $application->id,
            ]);

            // Note: Parties are created by the frontend in step 2 of the wizard
            // The frontend pre-populates the form with the logged-in user's data

            return $application;
        });
    }

    public function updateApplication(Application $application, array $data): Application
    {
        return DB::transaction(function () use ($application, $data) {
            $this->applicationRepository->update($application, $data);

            // Handle Priority Claims
            if (isset($data['priority_claims'])) {
                $this->applicationRepository->syncPriorityClaims($application, $data['priority_claims']);

                // Update metric: priority_count
                $this->updateMetrics($application, ['priority_count' => count($data['priority_claims'])]);
            }

            // Handle IPC Classes (Patent/Utility)
            if (isset($data['ipc_classes'])) {
                $this->applicationRepository->syncIpcClasses($application, $data['ipc_classes']);

                // Update metrics: ipc_groups, is_user_classified
                $count = count($data['ipc_classes']);
                $this->updateMetrics($application, [
                    'ipc_groups' => $count,
                    'is_user_classified' => $count > 0
                ]);
            }

            // Handle Locarno Classes (Industrial Design)
            if (isset($data['locarno_classes'])) {
                $this->applicationRepository->syncLocarnoClasses($application, $data['locarno_classes']);

                // Update metrics: ipc_groups (used for Locarno count too), is_user_classified
                $count = count($data['locarno_classes']);
                $this->updateMetrics($application, [
                    'ipc_groups' => $count,
                    'is_user_classified' => $count > 0
                ]);
            }

            return $application->refresh();
        });
    }

    public function updateMetrics(Application $application, array $data): ApplicationMetric
    {
        return $this->applicationMetricRepository->updateOrCreate(
            ['application_id' => $application->id],
            $data
        );
    }

    public function submitApplication(Application $application): Application
    {
        // 1. Validate Files
        $validationResults = $this->validateFiles($application);
        if (!empty($validationResults)) {
            $this->applicationRepository->update($application, ['file_validation_results' => $validationResults]);
            throw \Illuminate\Validation\ValidationException::withMessages([
                'files' => 'Missing required documents: ' . implode(', ', $validationResults)
            ]);
        }

        // 2. Generate Fee Quote only if no unpaid quote exists
        // Check if there's already an unpaid fee quote (DRAFT or FINAL status)
        $existingUnpaidQuote = $application->feeQuotes()
            ->whereIn('status', ['DRAFT', 'FINAL'])
            ->first();

        if (!$existingUnpaidQuote) {
            // Only generate if no unpaid quote exists
            $this->quoteGenerator->generate($application, 'TT263-2016');
        }

        return DB::transaction(function () use ($application) {
            // 3. Calculate Deadlines
            $deadlines = $this->calculateDeadlines($application);

            $this->applicationRepository->update($application, [
                'status' => ApplicationStatus::SUBMITTED,
                'filing_date' => now(), // Set filing date on submission
                'deadlines' => $deadlines,
                'file_validation_results' => null // Clear errors on success
            ]);
            $this->assignmentService->assignToFormalityExaminer($application);
            return $application;
        });
    }

    protected function validateFiles(Application $application): array
    {
        $missing = [];
        $attachments = $application->attachments()->pluck('doc_type')->toArray();
        \Illuminate\Support\Facades\Log::info('Validating files for app ' . $application->id, ['type' => $application->app_type, 'attachments' => $attachments]);

        // Map requirements based on AppType using DocType enum
        $required = match ($application->app_type) {
            \App\Enums\AppType::PATENT, \App\Enums\AppType::UTILITY => [
                \App\Enums\DocType::DESCRIPTION->value,
                \App\Enums\DocType::CLAIMS->value,
                \App\Enums\DocType::ABSTRACT->value,
            ],
            \App\Enums\AppType::INDUSTRIAL_DESIGN => [
                \App\Enums\DocType::ID_DESCRIPTION->value,
                \App\Enums\DocType::ID_PHOTOS_SET->value,
            ],
            default => []
        };

        foreach ($required as $req) {
            if (!in_array($req, $attachments)) {
                $missing[] = $req;
            }
        }

        // Conditional Check: Priority Claims
        if (($application->metrics->priority_count ?? 0) > 0) {
            if (!in_array(\App\Enums\DocType::PRIORITY_DOC->value, $attachments)) {
                $missing[] = \App\Enums\DocType::PRIORITY_DOC->value;
            }
        }

        return $missing;
    }

    protected function calculateDeadlines(Application $application): array
    {
        $filingDate = now();
        $deadlines = [];

        // Formality Exam: 1 month from filing (all types)
        $deadlines['formality_exam'] = $filingDate->copy()->addMonth()->toIso8601String();

        if ($application->app_type === \App\Enums\AppType::INDUSTRIAL_DESIGN) {
            // Industrial Design: Deadlines depend on acceptance date
            // Publication: 2 months from acceptance (set on formality exam pass)
            // Substantive Exam: 7 months from publication
            // These will be set by recalculateDeadlinesOnAcceptance() when formality exam passes
            $deadlines['publication'] = null;
            $deadlines['substantive_exam'] = null;
        } else {
            // Patent/Utility
            // Get earliest priority date from priorityClaims relationship
            $priorityDate = $application->priorityClaims()
                ->orderBy('filing_date', 'asc')
                ->first()?->filing_date;

            // Publication: 19th month from priority date or filing date
            $baseDate = $priorityDate ?? $filingDate;
            $deadlines['publication'] = $baseDate->copy()->addMonths(19)->toIso8601String();

            // Substantive Exam Request Deadline (from filing date)
            $months = $application->app_type === \App\Enums\AppType::PATENT ? 42 : 36;
            $deadlines['substantive_exam_request'] = $filingDate->copy()->addMonths($months)->toIso8601String();
        }

        return $deadlines;
    }

    /**
     * Recalculate deadlines for Industrial Design applications when formality exam passes.
     * This sets the publication and substantive exam deadlines based on actual acceptance date.
     */
    public function recalculateDeadlinesOnAcceptance(Application $application): void
    {
        if ($application->app_type !== \App\Enums\AppType::INDUSTRIAL_DESIGN) {
            return;
        }

        $acceptanceDate = now();
        $deadlines = $application->deadlines ?? [];

        // Publication: 2 months from acceptance
        $deadlines['publication'] = $acceptanceDate->copy()->addMonths(2)->toIso8601String();

        // Substantive Exam: 7 months from publication (= 9 months from acceptance)
        $deadlines['substantive_exam'] = $acceptanceDate->copy()->addMonths(9)->toIso8601String();

        $this->applicationRepository->update($application, ['deadlines' => $deadlines]);
    }
}
