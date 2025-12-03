<?php

namespace App\Services\Application;

use App\Models\Application;
use App\Models\ApplicationMetric;
use App\Models\ApplicationParty;
use App\Repositories\Application\ApplicationRepositoryInterface;
use App\Repositories\ApplicationMetric\ApplicationMetricRepositoryInterface;
use App\Repositories\ApplicationParty\ApplicationPartyRepositoryInterface;
use App\Services\Assignment\AssignmentService;
use App\Enums\ApplicationStatus;
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
        \App\Services\Fee\QuoteGenerator $quoteGenerator,
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

            // Add applicant party
            $this->applicationPartyRepository->create([
                'application_id' => $application->id,
                'role' => 'APPLICANT',
                'user_id' => $user->id,
                'is_primary' => true,
                'snapshot_name' => $user->name,
                'snapshot_email' => $user->email,
            ]);

            // If applicant is inventor, add inventor party
            if ($application->applicant_is_inventor) {
                $this->applicationPartyRepository->create([
                    'application_id' => $application->id,
                    'role' => 'INVENTOR',
                    'user_id' => $user->id,
                    'is_primary' => true,
                    'snapshot_name' => $user->name,
                    'snapshot_email' => $user->email,
                ]);
            }

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

        // 2. Refresh Fees
        // In a real scenario, we might want to force a recalculation here.
        // For now, we assume the user has already triggered fee calculation or we do it here.
        $this->quoteGenerator->generate($application, 'TT263-2016');

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

        // Map requirements based on AppType
        $required = match ($application->app_type) {
            \App\Enums\AppType::PATENT, \App\Enums\AppType::UTILITY => ['DESCRIPTION', 'CLAIMS', 'ABSTRACT'],
            \App\Enums\AppType::INDUSTRIAL_DESIGN => ['ID_DESCRIPTION', 'ID_PHOTOS_SET'],
            default => []
        };

        foreach ($required as $req) {
            if (!in_array($req, $attachments)) {
                $missing[] = $req;
            }
        }

        // Conditional Check: Priority Claims
        if (($application->metrics->priority_count ?? 0) > 0) {
            if (!in_array('PRIORITY_DOC', $attachments)) {
                $missing[] = 'PRIORITY_DOC';
            }
        }

        // Special check for Design Drawings quantity (min 4)
        if ($application->app_type === \App\Enums\AppType::INDUSTRIAL_DESIGN) {
             $drawingCount = $application->attachments()->where('doc_type', 'ID_PHOTOS_SET')->count();
             // Note: In a real app, we might check page count or file content.
             // Here we assume 1 attachment record = 1 set of drawings or check metadata.
             // For simplicity, let's just ensure at least one DRAWINGS file exists (already checked above).
             // If we want to enforce "4 views", we'd need more detailed metadata in Attachment.
        }

        return $missing;
    }

    protected function calculateDeadlines(Application $application): array
    {
        $filingDate = now();
        $deadlines = [];

        // Formality Exam: 1 month from filing
        $deadlines['formality_exam'] = $filingDate->copy()->addMonth()->toIso8601String();

        if ($application->app_type === \App\Enums\AppType::INDUSTRIAL_DESIGN) {
            // Publication: 2 months from accepted (approx 3 months from filing if smooth)
            // We can't set exact publication date yet as it depends on acceptance.
            // But we can set a target. Let's set it relative to filing for now or leave null.
            // Docs say: "Within 2 months from the date the application is accepted".

            // Substantive Exam: 7 months from publication.
            // Again, dependent on future events.
        } else {
            // Patent/Utility
            // Publication: 19th month from priority/filing
            $baseDate = $application->metrics->priority_date ?? $filingDate; // Assuming priority_date exists in metrics or we use filing
            // Note: priority_date is not yet in metrics, using filing date for now.
            $deadlines['publication'] = $filingDate->copy()->addMonths(19)->toIso8601String();

            // Substantive Exam Request Deadline
            $months = $application->app_type === \App\Enums\AppType::PATENT ? 42 : 36;
            $deadlines['substantive_exam_request'] = $filingDate->copy()->addMonths($months)->toIso8601String();
        }

        return $deadlines;
    }
}
