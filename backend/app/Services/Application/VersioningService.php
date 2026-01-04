<?php

declare(strict_types=1);

namespace App\Services\Application;

use App\Models\Application;
use App\Models\ApplicationRequest;
use App\Models\ApplicationVersion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class VersioningService
{
    /**
     * Create initial version snapshot when application is submitted.
     */
    public function createInitialVersion(Application $application, int $userId): ApplicationVersion
    {
        return ApplicationVersion::create([
            'application_id' => $application->id,
            'version_number' => 1,
            'amendment_request_id' => null,
            'snapshot_data' => $this->captureSnapshot($application),
            'change_summary' => 'Initial submission',
            'created_by' => $userId,
            'created_at' => now(),
        ]);
    }

    /**
     * Create new version after amendment approval.
     */
    public function createVersionFromAmendment(
        Application $application,
        ApplicationRequest $amendmentRequest,
        int $userId
    ): ApplicationVersion {
        return DB::transaction(function () use ($application, $amendmentRequest, $userId) {
            $nextVersion = $application->current_version + 1;

            $changeSummary = $amendmentRequest->amendment?->change_summary
                ?? 'Amendment approved';

            $version = ApplicationVersion::create([
                'application_id' => $application->id,
                'version_number' => $nextVersion,
                'amendment_request_id' => $amendmentRequest->id,
                'snapshot_data' => $this->captureSnapshot($application),
                'change_summary' => $changeSummary,
                'created_by' => $userId,
                'created_at' => now(),
            ]);

            $application->update(['current_version' => $nextVersion]);

            return $version;
        });
    }

    /**
     * Capture full application state as JSON snapshot.
     */
    public function captureSnapshot(Application $application): array
    {
        // Eager load all relationships needed for snapshot
        $application->load([
            'activeParties',
            'attachments' => function ($query) {
                $query->where('is_current', true);
            },
            'attachments.file',
            'priorityClaims',
            'ipcClasses',
            'locarnoClasses',
            'metrics',
        ]);

        return [
            'title' => $application->title,
            'app_type' => $application->app_type->value,
            'status' => $application->status->value,
            'applicant_is_inventor' => $application->applicant_is_inventor,
            'publication_early_requested' => $application->publication_early_requested,
            'pub_delay_months' => $application->pub_delay_months,
            'deadlines' => $application->deadlines,

            'parties' => $application->activeParties->map(fn ($party) => [
                'id' => $party->id,
                'application_id' => $party->application_id,
                'party_type' => $party->role, // Frontend uses party_type, backend uses role
                'role' => $party->role, // Keep role for backward compatibility
                'user_id' => $party->user_id,
                'name' => $party->snapshot_name, // Frontend uses name, backend uses snapshot_name
                'snapshot_name' => $party->snapshot_name,
                'email' => $party->snapshot_email, // Frontend uses email, backend uses snapshot_email
                'snapshot_email' => $party->snapshot_email,
                'address' => $party->snapshot_address, // Frontend uses address, backend uses snapshot_address
                'snapshot_address' => $party->snapshot_address,
                'phone' => $party->phone,
                'id_number' => $party->id_number,
                'id_type' => $party->id_type,
                'country_code' => $party->nationality, // Frontend uses country_code for 2-char code
                'nationality' => $party->nationality,
                'nationality_text' => $party->nationality_text,
                'is_primary' => $party->is_primary,
            ])->toArray(),

            'attachments' => $application->attachments->map(fn ($att) => [
                'id' => $att->id,
                'doc_type' => $att->doc_type,
                'file_id' => $att->file_id,
                'original_filename' => $att->file?->filename,
                'file_name' => $att->file?->filename,
                'filename' => $att->file?->filename, // Add this for consistency
                'page_count' => $att->page_count,
                'is_current' => $att->is_current,
            ])->toArray(),

            'priority_claims' => $application->priorityClaims->map(fn ($claim) => [
                'id' => $claim->id,
                'country_code' => $claim->country_code,
                'app_no' => $claim->app_no,
                'filing_date' => $claim->filing_date?->toDateString(),
            ])->toArray(),

            'ipc_classes' => $application->ipcClasses->map(fn ($ipc) => [
                'id' => $ipc->id,
                'ipc_code' => $ipc->ipc_code,
                'version' => $ipc->version,
                'sort_order' => $ipc->sort_order,
            ])->toArray(),

            'locarno_classes' => $application->locarnoClasses->map(fn ($loc) => [
                'id' => $loc->id,
                'class_no' => $loc->class_no,
                'subclass_no' => $loc->subclass_no,
                'version' => $loc->version,
                'field_of_use' => $loc->field_of_use,
            ])->toArray(),

            'metrics' => $application->metrics ? [
                'description_pages' => $application->metrics->description_pages,
                'abstract_pages' => $application->metrics->abstract_pages,
                'claims_independent' => $application->metrics->claims_independent,
                'claims_total' => $application->metrics->claims_total,
                'drawings_images' => $application->metrics->drawings_images,
                'ipc_groups' => $application->metrics->ipc_groups,
                'id_variants' => $application->metrics->id_variants,
                'id_images_per_variant' => $application->metrics->id_images_per_variant,
                'has_priority' => $application->metrics->has_priority,
                'priority_count' => $application->metrics->priority_count,
                'is_user_classified' => $application->metrics->is_user_classified,
            ] : null,

            'captured_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get specific version snapshot.
     */
    public function getVersion(Application $application, int $versionNumber): ?ApplicationVersion
    {
        return $application->versions()
            ->where('version_number', $versionNumber)
            ->first();
    }

    /**
     * Get version history for an application.
     */
    public function getVersionHistory(Application $application): Collection
    {
        return $application->versions()
            ->orderByDesc('version_number')
            ->get();
    }

    /**
     * Compare two versions and return differences.
     */
    public function compareVersions(
        Application $application,
        int $versionA,
        int $versionB
    ): array {
        $snapshotA = $this->getVersion($application, $versionA)?->snapshot_data;
        $snapshotB = $this->getVersion($application, $versionB)?->snapshot_data;

        if (!$snapshotA || !$snapshotB) {
            return ['error' => 'One or both versions not found'];
        }

        $differences = [];

        // Compare scalar fields
        $scalarFields = [
            'title', 'app_type', 'status', 'applicant_is_inventor',
            'publication_early_requested', 'pub_delay_months'
        ];

        foreach ($scalarFields as $field) {
            if (($snapshotA[$field] ?? null) !== ($snapshotB[$field] ?? null)) {
                $differences[$field] = [
                    'version_' . $versionA => $snapshotA[$field] ?? null,
                    'version_' . $versionB => $snapshotB[$field] ?? null,
                ];
            }
        }

        // Compare array counts
        $arrayFields = [
            'parties', 'attachments', 'priority_claims', 'ipc_classes', 'locarno_classes'
        ];

        foreach ($arrayFields as $field) {
            $countA = count($snapshotA[$field] ?? []);
            $countB = count($snapshotB[$field] ?? []);

            if ($countA !== $countB) {
                $differences[$field . '_count'] = [
                    'version_' . $versionA => $countA,
                    'version_' . $versionB => $countB,
                ];
            }
        }

        return [
            'version_a' => $versionA,
            'version_b' => $versionB,
            'differences' => $differences,
            'snapshots' => [
                'version_' . $versionA => $snapshotA,
                'version_' . $versionB => $snapshotB,
            ],
        ];
    }
}
