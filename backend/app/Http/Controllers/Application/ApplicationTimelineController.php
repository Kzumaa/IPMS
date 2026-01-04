<?php

declare(strict_types=1);

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimelineEventResource;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ApplicationTimelineController extends Controller
{
    /**
     * Get the unified timeline for an application.
     * Aggregates events from multiple sources: exam records, requests, decisions.
     */
    public function index(Request $request, Application $application): JsonResponse
    {
        $events = collect();

        // 1. Application creation event
        $events = $events->merge($this->getApplicationCreatedEvent($application));

        // 2. Formality Exam Records
        $events = $events->merge($this->getFormalityExamRecords($application));

        // 3. Substantive Exam Records
        $events = $events->merge($this->getSubstantiveExamRecords($application));

        // 4. Decision Records
        $events = $events->merge($this->getDecisionRecords($application));

        // 5. Application Requests (Amendments, Assignments, etc.)
        $events = $events->merge($this->getRequestEvents($application));

        // Sort by date descending (most recent first)
        $sortedEvents = $events->sortByDesc('date')->values();

        return response()->json([
            'data' => TimelineEventResource::collection($sortedEvents),
        ]);
    }

    /**
     * Get application created event.
     */
    private function getApplicationCreatedEvent(Application $application): Collection
    {
        $application->load(['creator']);

        $events = collect();

        // Application created event
        $events->push([
            'id' => "app_created_{$application->id}",
            'type' => 'APPLICATION_CREATED',
            'category' => 'system',
            'title' => 'Application Created',
            'description' => "Application draft created",
            'date' => $application->created_at->toIso8601String(),
            'actor' => $application->creator ? [
                'id' => $application->creator->id,
                'name' => $application->creator->full_name,
            ] : null,
            'data' => [
                'app_type' => $application->app_type->value,
            ],
            'icon' => 'add_circle',
            'color' => 'blue',
        ]);

        // Application submitted event (if filing_date exists)
        if ($application->filing_date) {
            $description = $application->app_no
                ? "Application accepted with number: {$application->app_no}"
                : "Application submitted for examination";

            $events->push([
                'id' => "app_submitted_{$application->id}",
                'type' => 'APPLICATION_SUBMITTED',
                'category' => 'system',
                'title' => 'Application Submitted',
                'description' => $description,
                'date' => $application->filing_date->toIso8601String(),
                'actor' => $application->creator ? [
                    'id' => $application->creator->id,
                    'name' => $application->creator->full_name,
                ] : null,
                'data' => [
                    'filing_number' => $application->app_no,
                ],
                'icon' => 'send',
                'color' => 'green',
            ]);
        }

        return $events;
    }

    /**
     * Get formality exam records as timeline events.
     */
    private function getFormalityExamRecords(Application $application): Collection
    {
        $application->load(['formalityExamRecords.examiner']);

        return $application->formalityExamRecords->map(function ($record) {
            $passed = $record->result === 'PASS';

            return [
                'id' => "formality_{$record->id}",
                'type' => 'FORMALITY_EXAM',
                'category' => 'examination',
                'title' => 'Formality Examination',
                'description' => $record->notes,
                'date' => $record->exam_date->toIso8601String(),
                'actor' => $record->examiner ? [
                    'id' => $record->examiner->id,
                    'name' => $record->examiner->full_name,
                ] : null,
                'data' => [
                    'result' => $record->result,
                    'passed' => $passed,
                ],
                'icon' => $passed ? 'check_circle' : 'cancel',
                'color' => $passed ? 'green' : 'red',
            ];
        });
    }

    /**
     * Get substantive exam records as timeline events.
     */
    private function getSubstantiveExamRecords(Application $application): Collection
    {
        $application->load(['substantiveExamRecords.examiner']);

        return $application->substantiveExamRecords->map(function ($record) {
            $colorMap = [
                'ACCEPTABLE' => 'green',
                'REJECTED' => 'red',
                'OBJECTION' => 'amber',
            ];

            $iconMap = [
                'ACCEPTABLE' => 'verified',
                'REJECTED' => 'cancel',
                'OBJECTION' => 'warning',
            ];

            return [
                'id' => "substantive_{$record->id}",
                'type' => 'SUBSTANTIVE_EXAM',
                'category' => 'examination',
                'title' => 'Substantive Examination',
                'description' => $record->notes,
                'date' => $record->exam_date->toIso8601String(),
                'actor' => $record->examiner ? [
                    'id' => $record->examiner->id,
                    'name' => $record->examiner->full_name,
                ] : null,
                'data' => [
                    'result' => $record->result,
                ],
                'icon' => $iconMap[$record->result] ?? 'pending',
                'color' => $colorMap[$record->result] ?? 'gray',
            ];
        });
    }

    /**
     * Get decision records as timeline events.
     */
    private function getDecisionRecords(Application $application): Collection
    {
        $application->load(['decisionRecords']);

        return $application->decisionRecords->map(function ($record) {
            $isGrant = $record->type === 'GRANT';

            return [
                'id' => "decision_{$record->id}",
                'type' => $record->type === 'GRANT' ? 'GRANT' : 'REFUSAL',
                'category' => 'decision',
                'title' => $isGrant ? 'Patent Granted' : 'Application Declined',
                'description' => $record->notes,
                'date' => $record->decision_date->toIso8601String(),
                'actor' => null,
                'data' => [
                    'decision_type' => $record->type,
                ],
                'icon' => $isGrant ? 'emoji_events' : 'block',
                'color' => $isGrant ? 'green' : 'red',
            ];
        });
    }

    /**
     * Get application requests as timeline events.
     */
    private function getRequestEvents(Application $application): Collection
    {
        $application->load([
            'requests.creator',
            'requests.processor',
            'requests.amendment',
            'requests.assignment',
            'requests.license',
            'requests.appeal',
        ]);

        return $application->requests->map(function ($request) {
            $typeInfo = $this->getRequestTypeInfo($request->type->value);
            $statusInfo = $this->getRequestStatusInfo($request->status->value);

            return [
                'id' => "request_{$request->id}",
                'type' => "REQUEST_{$request->type->value}",
                'category' => 'request',
                'title' => $typeInfo['title'],
                'description' => $this->formatRequestDescription($request),
                'date' => $request->request_date?->toIso8601String() ?? $request->created_at->toIso8601String(),
                'actor' => $request->creator ? [
                    'id' => $request->creator->id,
                    'name' => $request->creator->full_name,
                ] : null,
                'data' => [
                    'request_id' => $request->id,
                    'request_type' => $request->type->value,
                    'status' => $request->status->value,
                    'processed_date' => $request->processed_date?->format('Y-m-d'),
                    'processing_notes' => $request->processing_notes,
                ],
                'icon' => $typeInfo['icon'],
                'color' => $statusInfo['color'],
            ];
        });
    }

    /**
     * Get display info for request types.
     */
    private function getRequestTypeInfo(string $type): array
    {
        $typeMap = [
            'AMENDMENT' => ['title' => 'Amendment Request', 'icon' => 'edit_document'],
            'ASSIGNMENT' => ['title' => 'Assignment Request', 'icon' => 'swap_horiz'],
            'LICENSE' => ['title' => 'License Request', 'icon' => 'license'],
            'SPLIT' => ['title' => 'Split Request', 'icon' => 'call_split'],
            'CONVERSION' => ['title' => 'Conversion Request', 'icon' => 'change_circle'],
            'APPEAL' => ['title' => 'Appeal', 'icon' => 'gavel'],
        ];

        return $typeMap[$type] ?? ['title' => $type, 'icon' => 'description'];
    }

    /**
     * Get display info for request status.
     */
    private function getRequestStatusInfo(string $status): array
    {
        $statusMap = [
            'DRAFT' => ['color' => 'gray'],
            'SUBMITTED' => ['color' => 'blue'],
            'EXAMINING' => ['color' => 'amber'],
            'APPROVED' => ['color' => 'green'],
            'REFUSED' => ['color' => 'red'],
            'RECORDED' => ['color' => 'green'],
        ];

        return $statusMap[$status] ?? ['color' => 'gray'];
    }

    /**
     * Format request description based on type and details.
     */
    private function formatRequestDescription($request): ?string
    {
        $status = $request->status->value;
        $statusText = match ($status) {
            'DRAFT' => 'Draft',
            'SUBMITTED' => 'Submitted',
            'EXAMINING' => 'Under examination',
            'APPROVED' => 'Approved',
            'REFUSED' => 'Refused',
            'RECORDED' => 'Recorded',
            default => $status,
        };

        $detail = '';
        if ($request->relationLoaded('amendment') && $request->amendment) {
            $detail = " - {$request->amendment->section->label()}";
        } elseif ($request->relationLoaded('assignment') && $request->assignment) {
            $detail = " - {$request->assignment->transfer_type->label()}";
        } elseif ($request->relationLoaded('license') && $request->license) {
            $detail = " - {$request->license->license_type->label()}";
        } elseif ($request->relationLoaded('appeal') && $request->appeal) {
            $detail = " - {$request->appeal->appeal_type->label()}";
        }

        return "Status: {$statusText}{$detail}";
    }
}
