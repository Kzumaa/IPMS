import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllApplications } from '@/features/staff/store/staffSlice';
import { ApplicationStatus, ApplicationStatusColors, AppTypeLabels } from '@/features/application/types/enums';
import { Link } from 'react-router-dom';

export default function StaffPublishedApplicationsPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { allApplications, applicationsLoading, applicationsError, currentPage, totalPages, total } = useAppSelector(
        (state) => state.staff
    );

    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pre-defined list of published statuses to filter the dropdown if desired, 
    // but the backend will filter the actual results.
    // We can keep the dropdown as is, or filter it to only show relevant statuses.
    const publishedStatusOptions = [
        'PUBLISHED',
        'SUBSTANTIVE_CHECKING',
        'GRANTED',
        'CHANGE_REQUEST',
        'CHANGE_CHECKING',
        'DECLINED'
    ];

    useEffect(() => {
        const params = {
            status: statusFilter || undefined,
            app_type: typeFilter || undefined,
            search: searchQuery || undefined,
            page: currentPage,
            per_page: 15,
            published_only: true, // Force published only
        };

        dispatch(fetchAllApplications(params));
    }, [dispatch, statusFilter, typeFilter, searchQuery, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search will trigger via useEffect
    };

    const handlePageChange = (page: number) => {
        const params = {
            status: statusFilter || undefined,
            app_type: typeFilter || undefined,
            search: searchQuery || undefined,
            page: page,
            per_page: 15,
            published_only: true,
        };

        dispatch(fetchAllApplications(params));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{t('staff.applications.publishedTitle')}</h1>
                <p className="text-gray-600">
                    {t('staff.applications.publishedSubtitle')}
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="col-span-2">
                        <input
                            type="text"
                            placeholder={t('staff.applications.searchPlaceholder')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">{t('staff.applications.allStatuses')}</option>
                        {publishedStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {t(`application.statuses.${status}`)}
                            </option>
                        ))}
                    </select>

                    {/* Type Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">{t('staff.applications.allTypes')}</option>
                        {Object.keys(AppTypeLabels).map((type) => (
                            <option key={type} value={type}>
                                {t(`application.appTypes.${type}`)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {applicationsLoading && (
                <div className="flex justify-center py-12">
                    <div className="text-gray-600">{t('staff.applications.loadingApplications')}</div>
                </div>
            )}

            {/* Error State */}
            {applicationsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">{t('staff.common.error')}: {applicationsError}</div>
                </div>
            )}

            {/* Applications List */}
            {!applicationsLoading && !applicationsError && (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('staff.applications.applicationNumber')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('staff.applications.columnTitle')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('staff.applications.type')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('staff.applications.status')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('staff.applications.publishedDate')} {/* Changed from Filing Date to Published Date if available, or just keeping context */}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('staff.applications.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allApplications.map((app) => {
                                    const statusColors = ApplicationStatusColors[app.status as keyof typeof ApplicationStatus];
                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {app.filing_number || `APP-${app.id}`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{app.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {t(`application.appTypes.${app.app_type}`)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors?.bg} ${statusColors?.text} ${statusColors?.border} border`}
                                                >
                                                    {t(`application.statuses.${app.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {/* Use relevant date. Filing date is safest common denominator */}
                                                {app.filing_date || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link to={`/staff/applications/${app.id}`} className="text-blue-600 hover:text-blue-900">
                                                    {t('staff.applications.viewDetails')}
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {t('staff.applications.showing', { count: allApplications.length, total })}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    {t('staff.applications.previous')}
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600">
                                    {t('staff.applications.page', { current: currentPage, total: totalPages })}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    {t('staff.applications.next')}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
