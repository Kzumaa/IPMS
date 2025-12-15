import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchApplications, deleteApplication, setFilters } from '../features/application/store/applicationSlice';
import { ApplicationList } from '../features/application/components';
import { ApplicationStatus, AppType } from '../features/application/types/enums';

const ApplicationsPage: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { applications, loading, error, pagination, filters } = useAppSelector(
        (state) => state.application
    );

    useEffect(() => {
        dispatch(fetchApplications(filters));
    }, [dispatch, filters]);

    const handleDelete = async (id: number) => {
        if (window.confirm(t('application.confirm.delete'))) {
            await dispatch(deleteApplication(id));
        }
    };

    const handleStatusFilter = (status: ApplicationStatus | '') => {
        dispatch(setFilters({
            ...filters,
            status: status || undefined,
            page: 1,
        }));
    };

    const handleTypeFilter = (appType: AppType | '') => {
        dispatch(setFilters({
            ...filters,
            app_type: appType || undefined,
            page: 1,
        }));
    };

    const handleSearch = (search: string) => {
        dispatch(setFilters({
            ...filters,
            search: search || undefined,
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        dispatch(setFilters({
            ...filters,
            page,
        }));
    };

    // Get status options from translations
    const statusOptions = Object.keys(ApplicationStatus).map((key) => ({
        value: key,
        label: t(`application.statuses.${key}`),
    }));

    // Get type options from translations
    const typeOptions = Object.keys(AppType).map((key) => ({
        value: key,
        label: t(`application.appTypes.${key}`),
    }));

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('application.pageTitle')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {t('application.pageSubtitle')}
                        </p>
                    </div>
                    <Link
                        to="/app/applications/new"
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <span className="material-symbols-outlined mr-2 !text-lg">add</span>
                        {t('application.createNew')}
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder={t('application.searchPlaceholder')}
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleStatusFilter(e.target.value as ApplicationStatus | '')}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('application.allStatuses')}</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <select
                                value={filters.app_type || ''}
                                onChange={(e) => handleTypeFilter(e.target.value as AppType | '')}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('application.allTypes')}</option>
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                {/* Applications List */}
                <ApplicationList
                    applications={applications}
                    loading={loading}
                    onDelete={handleDelete}
                />

                {/* Pagination */}
                {pagination.total > pagination.perPage && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('application.showingRange', {
                                from: ((pagination.currentPage - 1) * pagination.perPage) + 1,
                                to: Math.min(pagination.currentPage * pagination.perPage, pagination.total),
                                total: pagination.total,
                            })}
                        </p>

                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('application.prev')}
                            </button>

                            {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                                .filter(page => {
                                    const current = pagination.currentPage;
                                    return page === 1 || page === pagination.lastPage ||
                                        (page >= current - 1 && page <= current + 1);
                                })
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="text-slate-400">...</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-2 rounded-lg border transition-colors ${page === pagination.currentPage
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))}

                            <button
                                type="button"
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.lastPage}
                                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('application.next')}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ApplicationsPage;
