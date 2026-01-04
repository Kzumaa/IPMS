<?php

declare(strict_types=1);

namespace App\Services\Application;

use App\Models\Application;
use App\Models\ApplicationPendingVersion;
use App\Models\ApplicationRequest;
use App\Models\ApplicationVersion;
use App\Models\RequestAmendment;
use Illuminate\Support\Facades\DB;

class AmendmentVersionService
{
    protected VersioningService $versioningService;

    /**
     * Fields that cannot be modified after submission.
     */
    protected const READONLY_FIELDS = [
        'app_type',
        'filing_number',
        'filing_date',
        'is_pct',
        'pct_number',
        'pct_filing_date',
        'status',
    ];

    /**
     * Top-level fields that can be compared directly.
     */
    protected const SCALAR_FIELDS = [
        'title',
        'applicant_is_inventor',
        'publication_early_requested',
        'pub_delay_months',
    ];

    /**
     * Array/relation fields that need special comparison.
     */
    protected const ARRAY_FIELDS = [
        'parties',
        'attachments',
        'priority_claims',
        'ipc_classes',
        'locarno_classes',
        'metrics',
    ];

    public function __construct(VersioningService $versioningService)
    {
        $this->versioningService = $versioningService;
    }

    /**
     * Create a pending version for an amendment request.
     */
    public function createPendingVersion(
        Application $application,
        ApplicationRequest $request,
        array $proposedData,
        int $userId
    ): ApplicationPendingVersion {
        return DB::transaction(function () use ($application, $request, $proposedData, $userId) {
            // Capture current state for comparison
            $currentSnapshot = $this->versioningService->captureSnapshot($application);

            // Detect changes between current and proposed
            [$changedFields, $fieldChanges] = $this->detectChanges($currentSnapshot, $proposedData);

            // Calculate next version number
            $nextVersion = $application->current_version + 1;

            // Create pending version
            $pendingVersion = ApplicationPendingVersion::create([
                'application_id' => $application->id,
                'request_id' => $request->id,
                'version_number' => $nextVersion,
                'proposed_data' => $proposedData,
                'changed_fields' => $changedFields,
                'field_changes' => $fieldChanges,
                'created_by' => $userId,
                'created_at' => now(),
            ]);

            // Link to amendment record
            if ($request->amendment) {
                $request->amendment->update([
                    'pending_version_id' => $pendingVersion->id,
                ]);
            }

            return $pendingVersion;
        });
    }

    /**
     * Detect changes between current application state and proposed data.
     *
     * @return array{0: array<string>, 1: array<string, array{old: mixed, new: mixed}>}
     */
    public function detectChanges(array $current, array $proposed): array
    {
        $changedFields = [];
        $fieldChanges = [];

        // Compare scalar fields
        foreach (self::SCALAR_FIELDS as $field) {
            $currentValue = $current[$field] ?? null;
            $proposedValue = $proposed[$field] ?? null;

            if ($this->valuesAreDifferent($currentValue, $proposedValue)) {
                $changedFields[] = $field;
                $fieldChanges[$field] = [
                    'old' => $currentValue,
                    'new' => $proposedValue,
                ];
            }
        }

        // Compare parties
        $partyChanges = $this->compareParties(
            $current['parties'] ?? [],
            $proposed['parties'] ?? []
        );
        if (!empty($partyChanges)) {
            $changedFields[] = 'parties';
            $fieldChanges['parties'] = $partyChanges;
        }

        // Compare attachments (documents)
        $attachmentChanges = $this->compareAttachments(
            $current['attachments'] ?? [],
            $proposed['attachments'] ?? []
        );
        if (!empty($attachmentChanges)) {
            $changedFields[] = 'attachments';
            $fieldChanges['attachments'] = $attachmentChanges;
        }

        // Compare priority claims
        $priorityChanges = $this->comparePriorityClaims(
            $current['priority_claims'] ?? [],
            $proposed['priority_claims'] ?? []
        );
        if (!empty($priorityChanges)) {
            $changedFields[] = 'priority_claims';
            $fieldChanges['priority_claims'] = $priorityChanges;
        }

        // Compare metrics
        if ($this->metricsAreDifferent($current['metrics'] ?? null, $proposed['metrics'] ?? null)) {
            $changedFields[] = 'metrics';
            $fieldChanges['metrics'] = [
                'old' => $current['metrics'] ?? null,
                'new' => $proposed['metrics'] ?? null,
            ];
        }

        return [$changedFields, $fieldChanges];
    }

    /**
     * Apply pending version changes to the application (on approval).
     */
    public function applyPendingVersion(
        ApplicationPendingVersion $pending,
        int $staffId
    ): ApplicationVersion {
        return DB::transaction(function () use ($pending, $staffId) {
            $application = $pending->application;
            $proposed = $pending->proposed_data;

            // Apply scalar field changes
            $updateData = [];
            foreach (self::SCALAR_FIELDS as $field) {
                if ($pending->hasFieldChanged($field)) {
                    $updateData[$field] = $proposed[$field] ?? null;
                }
            }

            if (!empty($updateData)) {
                $application->update($updateData);
            }

            // Apply party changes
            if ($pending->hasFieldChanged('parties')) {
                $this->applyPartyChanges($application, $proposed['parties'] ?? []);
            }

            // Apply attachment changes (documents)
            if ($pending->hasFieldChanged('attachments')) {
                $this->applyAttachmentChanges($application, $pending->request, $proposed['attachments'] ?? []);
            }

            // Apply priority claim changes
            if ($pending->hasFieldChanged('priority_claims')) {
                $this->applyPriorityClaimChanges($application, $proposed['priority_claims'] ?? []);
            }

            // Apply metrics changes
            if ($pending->hasFieldChanged('metrics') && $proposed['metrics']) {
                $this->applyMetricsChanges($application, $proposed['metrics']);
            }

            // Refresh application for snapshot
            $application->refresh();

            // Create version record with field changes
            $version = ApplicationVersion::create([
                'application_id' => $application->id,
                'version_number' => $pending->version_number,
                'amendment_request_id' => $pending->request_id,
                'snapshot_data' => $this->versioningService->captureSnapshot($application),
                'change_summary' => $pending->request->amendment?->change_summary ?? 'Amendment applied',
                'field_changes' => $pending->field_changes,
                'created_by' => $staffId,
                'created_at' => now(),
            ]);

            // Update application version number
            $application->update(['current_version' => $pending->version_number]);

            return $version;
        });
    }

    /**
     * Discard a pending version (on rejection or cancellation).
     */
    public function discardPendingVersion(ApplicationPendingVersion $pending): void
    {
        DB::transaction(function () use ($pending) {
            // Unlink from amendment
            if ($pending->request->amendment) {
                $pending->request->amendment->update(['pending_version_id' => null]);
            }

            // Delete pending version
            $pending->delete();
        });
    }

    /**
     * Get pending version for an application if exists.
     */
    public function getPendingVersion(Application $application): ?ApplicationPendingVersion
    {
        return ApplicationPendingVersion::where('application_id', $application->id)
            ->whereHas('request', function ($query) {
                $query->whereIn('status', ['DRAFT', 'SUBMITTED', 'EXAMINING']);
            })
            ->first();
    }

    /**
     * Check if application has a pending amendment.
     */
    public function hasPendingAmendment(Application $application): bool
    {
        return $this->getPendingVersion($application) !== null;
    }

    /**
     * Get the current application data formatted for the amendment editor.
     */
    public function getAmendmentData(Application $application): array
    {
        $snapshot = $this->versioningService->captureSnapshot($application);

        return [
            'application_id' => $application->id,
            'current_version' => $application->current_version,
            'data' => $snapshot,
            'readonly_fields' => self::READONLY_FIELDS,
            'editable_fields' => array_merge(self::SCALAR_FIELDS, self::ARRAY_FIELDS),
        ];
    }

    // Private helper methods

    private function valuesAreDifferent(mixed $a, mixed $b): bool
    {
        if (is_array($a) && is_array($b)) {
            return $a !== $b;
        }

        return $a !== $b;
    }

    private function compareParties(array $current, array $proposed): array
    {
        $changes = [
            'added' => [],
            'removed' => [],
            'modified' => [],
        ];

        $currentById = collect($current)->keyBy('id')->toArray();
        $proposedById = collect($proposed)->keyBy(fn ($p) => $p['id'] ?? 'new_' . uniqid())->toArray();

        // Find removed parties
        foreach ($currentById as $id => $party) {
            if (!isset($proposedById[$id])) {
                $changes['removed'][] = $party;
            }
        }

        // Find added and modified parties
        foreach ($proposedById as $id => $party) {
            if (str_starts_with((string) $id, 'new_') || !isset($currentById[$id])) {
                $changes['added'][] = $party;
            } elseif ($this->partyIsDifferent($currentById[$id], $party)) {
                $changes['modified'][] = [
                    'old' => $currentById[$id],
                    'new' => $party,
                ];
            }
        }

        // Return empty array if no changes
        if (empty($changes['added']) && empty($changes['removed']) && empty($changes['modified'])) {
            return [];
        }

        return $changes;
    }

    private function partyIsDifferent(array $a, array $b): bool
    {
        // Compare using both naming conventions (backend: snapshot_*, frontend: name/email/address)
        $compareFields = [
            ['snapshot_name', 'name'],
            ['snapshot_email', 'email'],
            ['snapshot_address', 'address'],
            ['phone', 'phone'],
            ['id_number', 'id_number'],
            ['nationality', 'country_code'],
        ];

        foreach ($compareFields as $fieldPair) {
            $aValue = $a[$fieldPair[0]] ?? $a[$fieldPair[1]] ?? null;
            $bValue = $b[$fieldPair[0]] ?? $b[$fieldPair[1]] ?? null;
            if ($aValue !== $bValue) {
                return true;
            }
        }

        return false;
    }

    private function compareAttachments(array $current, array $proposed): array
    {
        $changes = [
            'added' => [],
            'removed' => [],
            'replaced' => [],
        ];

        $currentByType = collect($current)->groupBy('doc_type')->toArray();
        $proposedByType = collect($proposed)->groupBy('doc_type')->toArray();

        // Check for removed or replaced documents
        foreach ($currentByType as $docType => $docs) {
            if (!isset($proposedByType[$docType])) {
                $changes['removed'] = array_merge($changes['removed'], $docs);
            } else {
                // Check if document files are different
                $currentIds = collect($docs)->pluck('file_id')->toArray();
                $proposedIds = collect($proposedByType[$docType])->pluck('file_id')->toArray();

                $removed = array_diff($currentIds, $proposedIds);
                $added = array_diff($proposedIds, $currentIds);

                if (!empty($removed) || !empty($added)) {
                    $changes['replaced'][] = [
                        'doc_type' => $docType,
                        'old_count' => count($docs),
                        'new_count' => count($proposedByType[$docType]),
                    ];
                }
            }
        }

        // Check for new document types
        foreach ($proposedByType as $docType => $docs) {
            if (!isset($currentByType[$docType])) {
                $changes['added'] = array_merge($changes['added'], $docs);
            }
        }

        if (empty($changes['added']) && empty($changes['removed']) && empty($changes['replaced'])) {
            return [];
        }

        return $changes;
    }

    private function comparePriorityClaims(array $current, array $proposed): array
    {
        $changes = [
            'added' => [],
            'removed' => [],
        ];

        $currentByKey = [];
        foreach ($current as $claim) {
            $key = $claim['country_code'] . '_' . $claim['app_no'];
            $currentByKey[$key] = $claim;
        }

        $proposedByKey = [];
        foreach ($proposed as $claim) {
            $key = $claim['country_code'] . '_' . $claim['app_no'];
            $proposedByKey[$key] = $claim;
        }

        // Find removed claims
        foreach ($currentByKey as $key => $claim) {
            if (!isset($proposedByKey[$key])) {
                $changes['removed'][] = $claim;
            }
        }

        // Find added claims
        foreach ($proposedByKey as $key => $claim) {
            if (!isset($currentByKey[$key])) {
                $changes['added'][] = $claim;
            }
        }

        if (empty($changes['added']) && empty($changes['removed'])) {
            return [];
        }

        return $changes;
    }

    private function metricsAreDifferent(?array $current, ?array $proposed): bool
    {
        if ($current === null && $proposed === null) {
            return false;
        }

        if ($current === null || $proposed === null) {
            return true;
        }

        $compareFields = [
            'description_pages',
            'claims_total',
            'claims_independent',
            'drawings_images',
            'id_variants',
            'id_images_per_variant',
        ];

        foreach ($compareFields as $field) {
            if (($current[$field] ?? null) !== ($proposed[$field] ?? null)) {
                return true;
            }
        }

        return false;
    }

    private function applyPartyChanges(Application $application, array $proposedParties): void
    {
        // Mark all current parties as no longer valid
        $application->activeParties()->update(['valid_to' => now()]);

        // Create new party records from proposed data
        // Handle both frontend naming (party_type, name, email, address) and backend naming (role, snapshot_name, etc.)
        foreach ($proposedParties as $partyData) {
            $application->parties()->create([
                'role' => $partyData['role'] ?? $partyData['party_type'] ?? 'APPLICANT',
                'user_id' => $partyData['user_id'] ?? null,
                'snapshot_name' => $partyData['snapshot_name'] ?? $partyData['name'] ?? '',
                'snapshot_email' => $partyData['snapshot_email'] ?? $partyData['email'] ?? null,
                'snapshot_address' => $partyData['snapshot_address'] ?? $partyData['address'] ?? null,
                'phone' => $partyData['phone'] ?? null,
                'id_number' => $partyData['id_number'] ?? null,
                'id_type' => $partyData['id_type'] ?? null,
                'nationality' => $partyData['nationality'] ?? $partyData['country_code'] ?? null,
                'nationality_text' => $partyData['nationality_text'] ?? null,
                'is_primary' => $partyData['is_primary'] ?? false,
                'valid_from' => now(),
                'valid_to' => null,
            ]);
        }
    }

    private function applyAttachmentChanges(
        Application $application,
        ApplicationRequest $request,
        array $proposedAttachments
    ): void {
        // Get attachment change metadata from proposed data
        $pending = $request->amendment?->pendingVersion;
        $attachmentChanges = $pending?->proposed_data['_attachment_changes'] ?? null;

        if ($attachmentChanges) {
            $removedIds = $attachmentChanges['removed_attachment_ids'] ?? [];
            $newIds = $attachmentChanges['new_attachment_ids'] ?? [];

            // Mark removed attachments as not current
            if (!empty($removedIds)) {
                $application->attachments()
                    ->whereIn('id', $removedIds)
                    ->update(['is_current' => false]);
            }

            // Mark new request attachments as current
            if (!empty($newIds)) {
                $request->attachments()
                    ->whereIn('id', $newIds)
                    ->update(['is_current' => true]);
            }
        } else {
            // Fallback: legacy behavior - mark all old as not current, all new as current
            $application->attachments()
                ->whereNull('request_id')
                ->update(['is_current' => false]);

            $request->attachments()->update(['is_current' => true]);
        }
    }

    private function applyPriorityClaimChanges(Application $application, array $proposedClaims): void
    {
        // Delete existing claims
        $application->priorityClaims()->delete();

        // Create new claims from proposed data
        foreach ($proposedClaims as $claimData) {
            $application->priorityClaims()->create([
                'country_code' => $claimData['country_code'],
                'app_no' => $claimData['app_no'],
                'filing_date' => $claimData['filing_date'],
            ]);
        }
    }

    private function applyMetricsChanges(Application $application, array $metricsData): void
    {
        if ($application->metrics) {
            $application->metrics->update([
                'description_pages' => $metricsData['description_pages'] ?? $application->metrics->description_pages,
                'abstract_pages' => $metricsData['abstract_pages'] ?? $application->metrics->abstract_pages,
                'claims_independent' => $metricsData['claims_independent'] ?? $application->metrics->claims_independent,
                'claims_total' => $metricsData['claims_total'] ?? $application->metrics->claims_total,
                'drawings_images' => $metricsData['drawings_images'] ?? $application->metrics->drawings_images,
                'id_variants' => $metricsData['id_variants'] ?? $application->metrics->id_variants,
                'id_images_per_variant' => $metricsData['id_images_per_variant'] ?? $application->metrics->id_images_per_variant,
            ]);
        } else {
            $application->metrics()->create([
                'description_pages' => $metricsData['description_pages'] ?? 0,
                'abstract_pages' => $metricsData['abstract_pages'] ?? 0,
                'claims_independent' => $metricsData['claims_independent'] ?? 0,
                'claims_total' => $metricsData['claims_total'] ?? 0,
                'drawings_images' => $metricsData['drawings_images'] ?? 0,
                'id_variants' => $metricsData['id_variants'] ?? 0,
                'id_images_per_variant' => $metricsData['id_images_per_variant'] ?? 0,
            ]);
        }
    }
}
