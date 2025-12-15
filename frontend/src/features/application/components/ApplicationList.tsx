import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Application } from '../types/applicationTypes';
import ApplicationStatusBadge from './ApplicationStatusBadge';

interface ApplicationListProps {
    applications: Application[];
    loading?: boolean;
    onDelete?: (id: number) => void;
}

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const ApplicationList: React.FC<ApplicationListProps> = ({
    applications,
    loading = false,
    onDelete,
}) => {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">refresh</span>
                    <span className="text-slate-500 dark:text-slate-400">{t('application.loading')}</span>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">folder_open</span>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {t('application.noApplications')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {t('application.noApplicationsDesc')}
                </p>
                <Link
                    to="/app/applications/new"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <span className="material-symbols-outlined mr-2 !text-lg">add</span>
                    {t('application.createNew')}
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('application.table.filingNumber')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('application.table.appType')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('application.table.filingDate')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('application.table.status')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {t('application.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {applications.map((app) => (
                            <tr
                                key={app.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <Link
                                            to={`/app/applications/${app.id}`}
                                            className="text-sm font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                            {app.filing_number || `#${app.id}`}
                                        </Link>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                            {app.title}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {t(`application.appTypes.${app.app_type}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {formatDate(app.filing_date || app.created_at)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <ApplicationStatusBadge status={app.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            to={`/app/applications/${app.id}`}
                                            className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            title={t('common.view')}
                                        >
                                            <span className="material-symbols-outlined !text-xl">visibility</span>
                                        </Link>
                                        {app.status === 'DRAFT' && (
                                            <>
                                                <Link
                                                    to={`/app/applications/${app.id}/edit`}
                                                    className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <span className="material-symbols-outlined !text-xl">edit</span>
                                                </Link>
                                                {onDelete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(app.id)}
                                                        className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title={t('common.delete')}
                                                    >
                                                        <span className="material-symbols-outlined !text-xl">delete</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationList;
