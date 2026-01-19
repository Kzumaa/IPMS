<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationVersion extends Model
{
    /**
     * Disable default timestamps since we only use created_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'version_number',
        'amendment_request_id',
        'snapshot_data',
        'change_summary',
        'field_changes',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'version_number' => 'integer',
        'snapshot_data' => 'array',
        'field_changes' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function amendmentRequest(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'amendment_request_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Helper methods

    /**
     * Check if this is the initial version (version 1).
     */
    public function isInitialVersion(): bool
    {
        return $this->version_number === 1;
    }

    /**
     * Get the title from the snapshot.
     */
    public function getSnapshotTitleAttribute(): ?string
    {
        return $this->snapshot_data['title'] ?? null;
    }

    /**
     * Get the status from the snapshot.
     */
    public function getSnapshotStatusAttribute(): ?string
    {
        return $this->snapshot_data['status'] ?? null;
    }

    /**
     * Get the list of changed field paths.
     *
     * @return array<string>
     */
    public function getChangedFieldPaths(): array
    {
        if (!$this->field_changes) {
            return [];
        }

        return array_keys($this->field_changes);
    }

    /**
     * Get the change details for a specific field.
     *
     * @return array{old: mixed, new: mixed}|null
     */
    public function getFieldChange(string $fieldPath): ?array
    {
        return $this->field_changes[$fieldPath] ?? null;
    }

    /**
     * Check if this version has field-level changes tracked.
     */
    public function hasFieldChanges(): bool
    {
        return !empty($this->field_changes);
    }

    /**
     * Get the count of changes in this version.
     */
    public function getChangesCount(): int
    {
        return count($this->field_changes ?? []);
    }
}
