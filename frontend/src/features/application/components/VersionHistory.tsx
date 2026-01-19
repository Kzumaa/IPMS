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
  const [viewingVersion, setViewingVersion] = useState<ApplicationVersion | null>(null);

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
                      onClick={() => setViewingVersion(version)}
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

      {/* Version Details Modal */}
      {viewingVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingVersion(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {t('version.versionNumber', 'Version {{number}}', { number: viewingVersion.version_number })}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {formatDate(viewingVersion.created_at)}
                </p>
              </div>
              <button
                onClick={() => setViewingVersion(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
              {/* Change Summary */}
              {viewingVersion.change_summary && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('version.changeSummary', 'Change Summary')}
                  </h4>
                  <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg whitespace-pre-wrap">
                    {viewingVersion.change_summary}
                  </p>
                </div>
              )}

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {viewingVersion.amendment_request_id && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('version.requestId', 'Request ID')}
                    </h4>
                    <p className="text-sm text-slate-900 dark:text-white">
                      #{viewingVersion.amendment_request_id}
                    </p>
                  </div>
                )}
                {viewingVersion.created_by_user && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('version.createdBy', 'Created By')}
                    </h4>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {viewingVersion.created_by_user.name || viewingVersion.created_by_user.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Field Changes */}
              {viewingVersion.field_changes && Object.keys(viewingVersion.field_changes).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t('version.detailedChanges', 'Detailed Changes')}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(viewingVersion.field_changes).map(([fieldPath, change]) => (
                      <div key={fieldPath} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {getFieldLabel(fieldPath)}
                        </h5>

                        {/* Handle party changes with detailed info */}
                        {fieldPath === 'parties' && typeof change === 'object' && (change.added || change.removed || change.modified) ? (
                          (() => {
                            const getPartyDisplayName = (party: any): string => {
                              return party.snapshot_name || party.name || "Unknown";
                            };

                            const getPartyRole = (party: any): string => {
                              return party.role || party.party_type || "Unknown Role";
                            };

                            const renderPartyDetails = (party: any) => {
                              const name = getPartyDisplayName(party);
                              const email = party.snapshot_email || party.email;
                              const address = party.snapshot_address || party.address;
                              const phone = party.phone;
                              const idNumber = party.id_number;
                              const nationality = party.nationality_text || party.nationality || party.country_code;
                              const role = getPartyRole(party);

                              return (
                                <div className="text-xs space-y-0.5">
                                  <div className="font-semibold">{name} ({role})</div>
                                  {email && <div className="text-slate-600 dark:text-slate-400">Email: {email}</div>}
                                  {phone && <div className="text-slate-600 dark:text-slate-400">Phone: {phone}</div>}
                                  {address && <div className="text-slate-600 dark:text-slate-400">Address: {address}</div>}
                                  {idNumber && <div className="text-slate-600 dark:text-slate-400">ID: {idNumber}</div>}
                                  {nationality && <div className="text-slate-600 dark:text-slate-400">Nationality: {nationality}</div>}
                                </div>
                              );
                            };

                            const renderPartyFieldChanges = (oldParty: any, newParty: any) => {
                              const fields = [
                                { key: ['snapshot_name', 'name'], label: 'Name' },
                                { key: ['snapshot_email', 'email'], label: 'Email' },
                                { key: ['phone'], label: 'Phone' },
                                { key: ['snapshot_address', 'address'], label: 'Address' },
                                { key: ['id_number'], label: 'ID Number' },
                                { key: ['id_type'], label: 'ID Type' },
                                { key: ['nationality', 'country_code'], label: 'Nationality' },
                                { key: ['role', 'party_type'], label: 'Role' },
                              ];

                              const changes: Array<{ label: string; oldValue: string; newValue: string }> = [];

                              fields.forEach(({ key, label }) => {
                                const keys = Array.isArray(key) ? key : [key];
                                let oldValue = null;
                                let newValue = null;

                                for (const k of keys) {
                                  if (oldValue === null && oldParty[k] !== undefined) oldValue = oldParty[k];
                                  if (newValue === null && newParty[k] !== undefined) newValue = newParty[k];
                                }

                                if (oldValue !== newValue) {
                                  changes.push({
                                    label,
                                    oldValue: oldValue || '-',
                                    newValue: newValue || '-',
                                  });
                                }
                              });

                              return changes;
                            };

                            return (
                              <div className="space-y-3">
                                {/* Added Parties */}
                                {change.added && change.added.length > 0 && (
                                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                                      {t('version.added', 'Added')} ({change.added.length})
                                    </p>
                                    <div className="space-y-2">
                                      {change.added.map((party: any, idx: number) => (
                                        <div key={idx} className="border-l-2 border-green-400 pl-2">
                                          {renderPartyDetails(party)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Removed Parties */}
                                {change.removed && change.removed.length > 0 && (
                                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                      {t('version.removed', 'Removed')} ({change.removed.length})
                                    </p>
                                    <div className="space-y-2">
                                      {change.removed.map((party: any, idx: number) => (
                                        <div key={idx} className="border-l-2 border-red-400 pl-2 line-through opacity-70">
                                          {renderPartyDetails(party)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Modified Parties */}
                                {change.modified && change.modified.length > 0 && (
                                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                                      {t('version.modified', 'Modified')} ({change.modified.length})
                                    </p>
                                    <div className="space-y-3">
                                      {change.modified.map((mod: any, idx: number) => {
                                        const fieldChanges = renderPartyFieldChanges(mod.old, mod.new);
                                        return (
                                          <div key={idx} className="border-l-2 border-amber-400 pl-2">
                                            <div className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                              {getPartyDisplayName(mod.old || mod.new)} ({getPartyRole(mod.old || mod.new)})
                                            </div>
                                            {fieldChanges.length > 0 ? (
                                              <div className="space-y-2">
                                                {fieldChanges.map((fc, fcIdx) => (
                                                  <div key={fcIdx} className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                      <div className="text-slate-500 dark:text-slate-400 mb-0.5">{fc.label}</div>
                                                      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded line-through">
                                                        {fc.oldValue}
                                                      </div>
                                                    </div>
                                                    <div>
                                                      <div className="text-slate-500 dark:text-slate-400 mb-0.5">&nbsp;</div>
                                                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                                        {fc.newValue}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                                                No field changes detected
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : fieldPath === 'attachments' && typeof change === 'object' && (change.added || change.removed || change.replaced) ? (
                          <div className="space-y-3">
                            {/* Added files */}
                            {change.added && change.added.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {t('version.added', 'Added')} ({change.added.length}):
                                </span>
                                <ul className="list-disc list-inside ml-2 mt-1 text-slate-600 dark:text-slate-400">
                                  {change.added.map((doc: any, idx: number) => (
                                    <li key={idx}>
                                      {doc.filename || doc.doc_type || 'Document'}
                                      {doc.doc_type && doc.filename && ` (${doc.doc_type})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Removed files */}
                            {change.removed && change.removed.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-red-600 dark:text-red-400">
                                  {t('version.removed', 'Removed')} ({change.removed.length}):
                                </span>
                                <ul className="list-disc list-inside ml-2 mt-1 text-slate-600 dark:text-slate-400">
                                  {change.removed.map((doc: any, idx: number) => (
                                    <li key={idx} className="line-through">
                                      {doc.filename || doc.doc_type || 'Document'}
                                      {doc.doc_type && doc.filename && ` (${doc.doc_type})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Replaced files */}
                            {change.replaced && change.replaced.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                  {t('version.replaced', 'Replaced')} ({change.replaced.length}):
                                </span>
                                {change.replaced.map((replacement: any, idx: number) => (
                                  <div key={idx} className="mt-2 ml-2 border-l-2 border-amber-300 dark:border-amber-700 pl-3">
                                    <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                                      {replacement.doc_type}
                                    </div>

                                    {/* Old files */}
                                    {replacement.old_files && replacement.old_files.length > 0 && (
                                      <div className="mb-2">
                                        <span className="text-red-600 dark:text-red-400 text-xs">
                                          {t('version.old', 'Old')}:
                                        </span>
                                        <ul className="list-disc list-inside ml-2 mt-0.5 text-slate-600 dark:text-slate-400">
                                          {replacement.old_files.map((file: any, fileIdx: number) => (
                                            <li key={fileIdx} className="line-through">
                                              {file.filename || 'Unknown file'}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* New files */}
                                    {replacement.new_files && replacement.new_files.length > 0 && (
                                      <div>
                                        <span className="text-green-600 dark:text-green-400 text-xs">
                                          {t('version.new', 'New')}:
                                        </span>
                                        <ul className="list-disc list-inside ml-2 mt-0.5 text-slate-600 dark:text-slate-400">
                                          {replacement.new_files.map((file: any, fileIdx: number) => (
                                            <li key={fileIdx}>
                                              {file.filename || 'Unknown file'}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (change as any).old !== undefined || (change as any).new !== undefined ? (
                          /* Simple value changes */
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{t('version.old', 'Old')}</span>
                              <p className="text-red-600 dark:text-red-400 line-through">
                                {formatValue((change as any).old)}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 !text-base">arrow_forward</span>
                            <div className="flex-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{t('version.new', 'New')}</span>
                              <p className="text-green-600 dark:text-green-400">
                                {formatValue((change as any).new)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('version.noDetails', 'No details available')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!viewingVersion.field_changes || Object.keys(viewingVersion.field_changes).length === 0) && !viewingVersion.change_summary && (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">info</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('version.noChanges', 'No detailed changes recorded for this version')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
