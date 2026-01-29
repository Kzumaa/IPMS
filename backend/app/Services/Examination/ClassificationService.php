<?php

declare(strict_types=1);

namespace App\Services\Examination;

use App\Enums\ApplicationStatus;
use App\Enums\AppType;
use App\Models\Application;
use App\Models\IpcClass;
use App\Models\LocarnoClass;
use App\Services\Application\ApplicationService;
use App\Services\Fee\QuoteGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClassificationService
{
    protected ApplicationService $applicationService;
    protected QuoteGenerator $quoteGenerator;

    public function __construct(
        ApplicationService $applicationService,
        QuoteGenerator $quoteGenerator
    ) {
        $this->applicationService = $applicationService;
        $this->quoteGenerator = $quoteGenerator;
    }

    /**
     * Validate that classification can be assigned.
     *
     * @throws ValidationException
     */
    protected function validateCanAssign(Application $application): void
    {
        // Classification can only be assigned during formality examination
        if ($application->status !== ApplicationStatus::FORMALITY_EXAM) {
            throw ValidationException::withMessages([
                'application' => 'Classification can only be assigned during formality examination.',
            ]);
        }
    }

    /**
     * Assign IPC classes to a patent/utility application by staff.
     *
     * @param Application $application
     * @param array $classes Array of IPC class data [{ipc_code: string, version?: string}]
     * @param int $staffId
     * @return Application
     */
    public function assignIpcClasses(Application $application, array $classes, int $staffId): Application
    {
        $this->validateCanAssign($application);

        // Validate application type
        if (!in_array($application->app_type, [AppType::PATENT, AppType::UTILITY])) {
            throw ValidationException::withMessages([
                'application' => 'IPC classes can only be assigned to Patent or Utility applications.',
            ]);
        }

        return DB::transaction(function () use ($application, $classes, $staffId) {
            // Delete existing IPC classes
            $application->ipcClasses()->delete();

            // Create new IPC classes with staff assignment tracking
            foreach ($classes as $index => $classData) {
                IpcClass::create([
                    'application_id' => $application->id,
                    'ipc_code' => $classData['ipc_code'],
                    'version' => $classData['version'] ?? null,
                    'sort_order' => $index,
                    'assigned_by_type' => 'STAFF',
                    'assigned_by_id' => $staffId,
                    'assigned_at' => now(),
                ]);
            }

            // Update metrics
            $this->applicationService->updateMetrics($application, [
                'ipc_groups' => count($classes),
                'is_user_classified' => false, // Staff classified, not user
            ]);

            return $application->refresh();
        });
    }

    /**
     * Assign Locarno classes to an industrial design application by staff.
     *
     * @param Application $application
     * @param array $classes Array of Locarno class data [{class_no: string, subclass_no?: string, field_of_use?: string}]
     * @param int $staffId
     * @return Application
     */
    public function assignLocarnoClasses(Application $application, array $classes, int $staffId): Application
    {
        $this->validateCanAssign($application);

        // Validate application type
        if ($application->app_type !== AppType::INDUSTRIAL_DESIGN) {
            throw ValidationException::withMessages([
                'application' => 'Locarno classes can only be assigned to Industrial Design applications.',
            ]);
        }

        return DB::transaction(function () use ($application, $classes, $staffId) {
            // Delete existing Locarno classes
            $application->locarnoClasses()->delete();

            // Create new Locarno classes with staff assignment tracking
            foreach ($classes as $index => $classData) {
                LocarnoClass::create([
                    'application_id' => $application->id,
                    'class_no' => $classData['class_no'],
                    'subclass_no' => $classData['subclass_no'] ?? null,
                    'version' => $classData['version'] ?? null,
                    'field_of_use' => $classData['field_of_use'] ?? null,
                    'sort_order' => $index,
                    'assigned_by_type' => 'STAFF',
                    'assigned_by_id' => $staffId,
                    'assigned_at' => now(),
                ]);
            }

            // Update metrics
            $this->applicationService->updateMetrics($application, [
                'ipc_groups' => count($classes), // Used for Locarno count too
                'is_user_classified' => false, // Staff classified, not user
            ]);

            return $application->refresh();
        });
    }

    /**
     * Recalculate fees after classification change.
     * If user didn't provide classification and staff did, the classification fee may be waived.
     *
     * @param Application $application
     * @return \App\Models\FeeQuote|null
     */
    public function recalculateFeesAfterClassification(Application $application): ?\App\Models\FeeQuote
    {
        // Get the current unpaid fee quote
        $currentQuote = $application->feeQuotes()
            ->whereIn('status', ['DRAFT', 'FINAL', 'PENDING'])
            ->latest('generated_at')
            ->first();

        if (!$currentQuote) {
            return null;
        }

        // If the quote is already PAID, we can't recalculate
        if ($currentQuote->status === 'PAID') {
            return $currentQuote;
        }

        // Generate a new fee quote which will consider the current classification status
        return $this->quoteGenerator->generate($application, $currentQuote->law_version ?? 'TT263-2016');
    }

    /**
     * Get classification summary for an application.
     */
    public function getClassificationSummary(Application $application): array
    {
        $ipcClasses = $application->ipcClasses()->get();
        $locarnoClasses = $application->locarnoClasses()->get();

        return [
            'app_type' => $application->app_type->value,
            'ipc_classes' => $ipcClasses->map(fn ($c) => [
                'id' => $c->id,
                'ipc_code' => $c->ipc_code,
                'version' => $c->version,
                'assigned_by_type' => $c->assigned_by_type,
                'assigned_at' => $c->assigned_at?->toIso8601String(),
            ])->toArray(),
            'locarno_classes' => $locarnoClasses->map(fn ($c) => [
                'id' => $c->id,
                'class_no' => $c->class_no,
                'subclass_no' => $c->subclass_no,
                'field_of_use' => $c->field_of_use,
                'assigned_by_type' => $c->assigned_by_type,
                'assigned_at' => $c->assigned_at?->toIso8601String(),
            ])->toArray(),
            'is_user_classified' => $application->metrics?->is_user_classified ?? false,
            'total_classes' => $ipcClasses->count() + $locarnoClasses->count(),
        ];
    }
}
