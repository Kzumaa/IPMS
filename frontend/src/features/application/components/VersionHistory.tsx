import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationService } from '../services/applicationService';
import type { ApplicationVersion, FieldChange } from '../types/applicationTypes';

interface VersionHistoryProps {
  applicationId: number;
  onViewVersion?: (version: ApplicationVersion) => void;
  onCompareVersions?: (versionA: number, versionB: number) => void;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fieldLabels: Record<string, string> = {
  'title': 'Title',
  'applicant_is_inventor': 'Applicant is Inventor',
  'parties': 'Parties',
  'attachments': 'Documents',
  'priority_claims': 'Priority Claims',
  'metrics': 'Metrics',
};

const getFieldLabel = (fieldPath: string): string => {
  return fieldLabels[fieldPath] || fieldPath;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    // Handle arrays (like parties)
    if (Array.isArray(value)) {
      return `${value.length} item(s)`;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

interface FieldChangeDisplayProps {
  fieldPath: string;
  change: FieldChange;
}

const FieldChangeDisplay: React.FC<FieldChangeDisplayProps> = ({ fieldPath, change }) => {
  const label = getFieldLabel(fieldPath);

  // Handle complex changes (parties, metrics, etc.)
  if (fieldPath === 'parties' && typeof change.new === 'object') {
    const partyChanges = change.new as { added?: unknown[]; removed?: unknown[]; modified?: unknown[] };
    const addedCount = partyChanges.added?.length || 0;
    const removedCount = partyChanges.removed?.length || 0;
    const modifiedCount = partyChanges.modified?.length || 0;

    return (
      <div className="text-xs bg-slate-100 dark:bg-slate-700 rounded p-2">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {addedCount > 0 && (
            <span className="text-green-600 dark:text-green-400">+{addedCount} added</span>
          )}
          {removedCount > 0 && (
            <span className="text-red-600 dark:text-red-400">-{removedCount} removed</span>
          )}
          {modifiedCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400">{modifiedCount} modified</span>
          )}
        </div>
      </div>
    );
  }

  // Simple value changes
  return (
    <div className="text-xs bg-slate-100 dark:bg-slate-700 rounded p-2">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}:</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-red-600 dark:text-red-400 line-through">{formatValue(change.old)}</span>
        <span className="material-symbols-outlined text-slate-400 !text-xs">arrow_forward</span>
        <span className="text-green-600 dark:text-green-400">{formatValue(change.new)}</span>
      </div>
    </div>
  );
};

const VersionHistory: React.FC<VersionHistoryProps> = ({
  applicationId,
  onViewVersion,
  onCompareVersions,
}) => {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<ApplicationVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await applicationService.getVersionHistory(applicationId);
        setVersions(response.data);
      } catch (err) {
        setError(t('version.loadError', 'Failed to load version history'));
        console.error('Failed to load version history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [applicationId, t]);

  const handleVersionSelect = (versionNumber: number) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionNumber)) {
        return prev.filter((v) => v !== versionNumber);
      }
      if (prev.length < 2) {
        return [...prev, versionNumber];
      }
      return [prev[1], versionNumber];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      const [versionA, versionB] = selectedVersions.sort((a, b) => a - b);
      onCompareVersions(versionA, versionB);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('version.title', 'Version History')}
        </h3>
        <div className="flex items-center justify-center py-8">
          <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
            refresh
          </span>
          <span className="text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('version.title', 'Version History')}
        </h3>
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('version.title', 'Version History')}
        </h3>
        <div className="flex items-center gap-2">
          {selectedVersions.length === 2 && onCompareVersions && (
            <button
              type="button"
              onClick={handleCompare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined !text-base">compare</span>
              {t('version.compare', 'Compare')}
            </button>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {versions.length} {t('version.versions', 'versions')}
          </span>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">
            history
          </span>
          <p className="text-slate-500 dark:text-slate-400">
            {t('version.empty', 'No version history available')}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

          {/* Version entries */}
          <div className="space-y-4">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const isSelected = selectedVersions.includes(version.version_number);

              return (
                <div key={version.id} className="relative flex items-start pl-10">
                  {/* Dot with checkbox for comparison */}
                  <div className="absolute left-1 flex items-center">
                    {onCompareVersions ? (
                      <button
                        type="button"
                        onClick={() => handleVersionSelect(version.version_number)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isLatest
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-400'
                        }`}
                        title={isSelected ? t('version.deselect', 'Deselect') : t('version.select', 'Select for comparison')}
                      >
                        {isSelected ? (
                          <span className="material-symbols-outlined !text-sm">check</span>
                        ) : (
                          <span className="text-xs font-bold">{version.version_number}</span>
                        )}
                      </button>
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isLatest
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{version.version_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500'
                          : isLatest
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => onViewVersion?.(version)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              isLatest
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {t('version.versionNumber', 'Version {{number}}', {
                              number: version.version_number,
                            })}
                            {isLatest && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                                {t('version.current', 'Current')}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(version.created_at)}
                        </span>
                      </div>

                      {version.change_summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {version.change_summary}
                        </p>
                      )}

                      {version.amendment_request_id && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {t('version.fromAmendment', 'From amendment request #{{id}}', {
                            id: version.amendment_request_id,
                          })}
                        </p>
                      )}

                      {version.created_by_user && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {t('version.createdBy', 'Created by {{name}}', {
                            name: version.created_by_user.name || version.created_by_user.email,
                          })}
                        </p>
                      )}

                      {/* Field-level changes */}
                      {version.field_changes && Object.keys(version.field_changes).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t('version.changedFields', 'Changed fields:')}
                          </p>
                          <div className="space-y-2">
                            {Object.entries(version.field_changes).map(([fieldPath, change]) => (
                              <FieldChangeDisplay
                                key={fieldPath}
                                fieldPath={fieldPath}
                                change={change}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedVersions.length > 0 && selectedVersions.length < 2 && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
          {t('version.selectAnother', 'Select one more version to compare')}
        </p>
      )}
    </div>
  );
};

export default VersionHistory;
