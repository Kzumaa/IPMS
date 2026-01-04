<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationPendingVersion extends Model
{
    /**
     * Disable default timestamps since we only use created_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'request_id',
        'version_number',
        'proposed_data',
        'changed_fields',
        'field_changes',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'version_number' => 'integer',
        'proposed_data' => 'array',
        'changed_fields' => 'array',
        'field_changes' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ApplicationRequest::class, 'request_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Helper methods

    /**
     * Get the list of changed field paths.
     *
     * @return array<string>
     */
    public function getChangedFieldPaths(): array
    {
        return $this->changed_fields ?? [];
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
     * Check if a field has been changed.
     */
    public function hasFieldChanged(string $fieldPath): bool
    {
        return in_array($fieldPath, $this->changed_fields ?? [], true);
    }

    /**
     * Get the proposed value for a field path.
     */
    public function getProposedValue(string $fieldPath): mixed
    {
        $keys = explode('.', $fieldPath);
        $value = $this->proposed_data;

        foreach ($keys as $key) {
            if (!is_array($value) || !array_key_exists($key, $value)) {
                return null;
            }
            $value = $value[$key];
        }

        return $value;
    }

    /**
     * Get the count of changes.
     */
    public function getChangesCount(): int
    {
        return count($this->changed_fields ?? []);
    }
}
