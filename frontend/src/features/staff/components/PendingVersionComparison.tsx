import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationService } from '../../application/services/applicationService';
import type { PendingVersion, FieldChange } from '../../application/types/applicationTypes';

interface PendingVersionComparisonProps {
    applicationId: number;
}

const PendingVersionComparison: React.FC<PendingVersionComparisonProps> = ({ applicationId }) => {
    const { t } = useTranslation();
    const [pendingVersion, setPendingVersion] = useState<PendingVersion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPendingVersion = async () => {
            try {
                setLoading(true);
                const response = await applicationService.getPendingVersion(applicationId);
                setPendingVersion(response.data);
            } catch (err) {
                setError('Failed to load pending version');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingVersion();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">refresh</span>
                <span className="text-slate-500">{t('common.loading', 'Loading...')}</span>
            </div>
        );
    }

    if (error || !pendingVersion) {
        return null;
    }

    const getFieldLabel = (fieldPath: string): string => {
        const labels: Record<string, string> = {
            'title': t('application.fields.title', 'Title'),
            'applicant_is_inventor': t('application.fields.applicantIsInventor', 'Applicant is Inventor'),
            'parties': t('application.fields.parties', 'Parties'),
            'attachments': t('application.fields.attachments', 'Documents'),
            'priority_claims': t('application.fields.priorityClaims', 'Priority Claims'),
            'metrics': t('application.fields.metrics', 'Metrics'),
        };
        return labels[fieldPath] || fieldPath;
    };

    const renderFieldChange = (fieldPath: string, change: FieldChange) => {
        if (fieldPath === 'parties') {
            return renderPartyChanges(change);
        }

        if (fieldPath === 'metrics') {
            return renderMetricsChanges(change);
        }

        // Simple value changes
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                        {t('common.before', 'Before')}
                    </p>
                    <p className="text-sm text-red-900 dark:text-red-100">
                        {formatValue(change.old)}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                        {t('common.after', 'After')}
                    </p>
                    <p className="text-sm text-green-900 dark:text-green-100">
                        {formatValue(change.new)}
                    </p>
                </div>
            </div>
        );
    };

    const renderPartyChanges = (change: FieldChange) => {
        const partyChanges = change.new as { added?: unknown[]; removed?: unknown[]; modified?: unknown[] };

        return (
            <div className="space-y-3">
                {partyChanges.added && partyChanges.added.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                            {t('amendment.changes.partiesAdded', 'Added Parties')}
                        </p>
                        <ul className="text-sm text-green-900 dark:text-green-100 space-y-1">
                            {partyChanges.added.map((party: any, idx: number) => (
                                <li key={idx} className="flex items-center">
                                    <span className="material-symbols-outlined text-green-500 text-sm mr-1">add</span>
                                    {party.snapshot_name} ({party.role})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {partyChanges.removed && partyChanges.removed.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                            {t('amendment.changes.partiesRemoved', 'Removed Parties')}
                        </p>
                        <ul className="text-sm text-red-900 dark:text-red-100 space-y-1">
                            {partyChanges.removed.map((party: any, idx: number) => (
                                <li key={idx} className="flex items-center">
                                    <span className="material-symbols-outlined text-red-500 text-sm mr-1">remove</span>
                                    {party.snapshot_name} ({party.role})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {partyChanges.modified && partyChanges.modified.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
                            {t('amendment.changes.partiesModified', 'Modified Parties')}
                        </p>
                        <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1">
                            {partyChanges.modified.map((mod: any, idx: number) => (
                                <li key={idx} className="flex items-center">
                                    <span className="material-symbols-outlined text-amber-500 text-sm mr-1">edit</span>
                                    {mod.old?.snapshot_name || mod.new?.snapshot_name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderMetricsChanges = (change: FieldChange) => {
        const oldMetrics = change.old as Record<string, number> | null;
        const newMetrics = change.new as Record<string, number> | null;

        const metricLabels: Record<string, string> = {
            'description_pages': t('application.metrics.descriptionPages', 'Description Pages'),
            'claims_total': t('application.metrics.claimsTotal', 'Total Claims'),
            'claims_independent': t('application.metrics.independentClaims', 'Independent Claims'),
            'drawings_images': t('application.metrics.drawings', 'Drawings'),
            'id_variants': t('application.metrics.variants', 'Design Variants'),
        };

        const allKeys = new Set([
            ...Object.keys(oldMetrics || {}),
            ...Object.keys(newMetrics || {}),
        ]);

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                {t('common.metric', 'Metric')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-500">
                                {t('common.before', 'Before')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-500">
                                {t('common.after', 'After')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {Array.from(allKeys).map((key) => {
                            const oldVal = oldMetrics?.[key] ?? '-';
                            const newVal = newMetrics?.[key] ?? '-';
                            const changed = oldVal !== newVal;

                            return (
                                <tr key={key} className={changed ? 'bg-amber-50 dark:bg-amber-900/10' : ''}>
                                    <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                                        {metricLabels[key] || key}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                                        {oldVal}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">
                                        {newVal}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
                <span className="material-symbols-outlined text-amber-500 mr-2">compare_arrows</span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('amendment.pendingChanges', 'Pending Changes')}
                </h2>
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                    {t('amendment.version', 'Version {{number}}', { number: pendingVersion.version_number })}
                </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('amendment.changesDescription', 'Review the proposed changes below before approving or rejecting this amendment.')}
            </p>

            {/* Changed Fields Summary */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {t('amendment.fieldsChanged', 'Fields Changed:')} {pendingVersion.changes_count}
                </p>
                <div className="flex flex-wrap gap-2">
                    {pendingVersion.changed_fields.map((field) => (
                        <span
                            key={field}
                            className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
                        >
                            {getFieldLabel(field)}
                        </span>
                    ))}
                </div>
            </div>

            {/* Detailed Changes */}
            <div className="space-y-6">
                {Object.entries(pendingVersion.field_changes).map(([fieldPath, change]) => (
                    <div key={fieldPath} className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center">
                            <span className="material-symbols-outlined text-amber-500 text-sm mr-1">edit</span>
                            {getFieldLabel(fieldPath)}
                        </h4>
                        {renderFieldChange(fieldPath, change)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingVersionComparison;
