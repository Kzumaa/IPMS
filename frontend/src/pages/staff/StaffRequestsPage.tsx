import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRequests } from '@/features/staff/store/staffSlice';
import { RequestStatusBadge, RequestTypeBadge } from '@/features/request/components';
import type { RequestType, RequestStatus } from '@/features/request/types/enums';

const RequestTypeOptions = ['AMENDMENT', 'ASSIGNMENT', 'LICENSE', 'SPLIT', 'COMPLAINT', 'RENEWAL', 'TERMINATION', 'WITHDRAWAL'];
const RequestStatusOptions = ['SUBMITTED', 'EXAMINING', 'APPROVED', 'REFUSED', 'RECORDED'];

export default function StaffRequestsPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { requests, requestsLoading, requestsError, requestsPage, requestsTotalPages, requestsTotal } = useAppSelector(
        (state) => state.staff
    );

    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        const params = {
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            page: requestsPage,
            per_page: 15,
        };
        dispatch(fetchRequests(params));
    }, [dispatch, typeFilter, statusFilter, requestsPage]);

    const handlePageChange = (page: number) => {
        const params = {
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            page: page,
            per_page: 15,
        };
        dispatch(fetchRequests(params));
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{t('staff.requests.title')}</h1>
                <p className="text-gray-600">{t('staff.requests.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Type Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">{t('staff.requests.allTypes')}</option>
                        {RequestTypeOptions.map((type) => (
                            <option key={type} value={type}>
                                {t(`request.types.${type}`)}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">{t('staff.requests.allStatuses')}</option>
                        {RequestStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {t(`request.statuses.${status}`)}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    <button
                        onClick={() => {
                            setTypeFilter('');
                            setStatusFilter('');
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {t('staff.requests.clearFilters')}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {requestsLoading && (
                <div className="flex justify-center py-12">
                    <div className="text-gray-600">{t('staff.requests.loading')}</div>
                </div>
            )}

            {/* Error State */}
            {requestsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">{t('staff.common.error')}: {requestsError}</div>
                </div>
            )}

            {/* Requests List */}
            {!requestsLoading && !requestsError && (
                <>
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">pending_actions</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('staff.requests.noRequests')}</h3>
                            <p className="text-gray-500">{t('staff.requests.noRequestsDesc')}</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.requestId')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.application')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.type')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.requestDate')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('staff.requests.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                REQ-{request.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>
                                                    <span className="font-medium">
                                                        {request.application?.filing_number || `APP-${request.application_id}`}
                                                    </span>
                                                </div>
                                                <div className="text-gray-500 text-xs truncate max-w-xs">
                                                    {request.application?.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RequestTypeBadge type={request.type as RequestType} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RequestStatusBadge status={request.status as RequestStatus} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(request.request_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/staff/requests/${request.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {t('staff.requests.viewDetails')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {requestsTotalPages > 1 && (
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {t('staff.requests.showing', { count: requests.length, total: requestsTotal })}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(requestsPage - 1)}
                                    disabled={requestsPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    {t('staff.applications.previous')}
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600">
                                    {t('staff.applications.page', { current: requestsPage, total: requestsTotalPages })}
                                </span>
                                <button
                                    onClick={() => handlePageChange(requestsPage + 1)}
                                    disabled={requestsPage === requestsTotalPages}
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
