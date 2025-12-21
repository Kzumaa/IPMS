import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/features/staff/store/staffSlice';

export default function StaffDashboardPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { dashboardStats, statsLoading, statsError } = useAppSelector((state) => state.staff);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (statsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">{t('staff.dashboard.loadingDashboard')}</div>
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600">{t('staff.dashboard.error', { error: statsError })}</div>
            </div>
        );
    }

    if (!dashboardStats) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('staff.dashboard.title')}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-2">{t('staff.dashboard.totalApplications')}</div>
                    <div className="text-3xl font-bold text-gray-900">{dashboardStats.total_applications}</div>
                </div>

                <div className="bg-blue-50 rounded-lg shadow p-6">
                    <div className="text-sm text-blue-600 mb-2">{t('staff.dashboard.assignedToMe')}</div>
                    <div className="text-3xl font-bold text-blue-900">{dashboardStats.assigned_to_me}</div>
                </div>

                <div className="bg-yellow-50 rounded-lg shadow p-6">
                    <div className="text-sm text-yellow-600 mb-2">{t('staff.dashboard.pendingFormalityExam')}</div>
                    <div className="text-3xl font-bold text-yellow-900">{dashboardStats.pending_formality_exam}</div>
                </div>

                <div className="bg-purple-50 rounded-lg shadow p-6">
                    <div className="text-sm text-purple-600 mb-2">{t('staff.dashboard.pendingSubstantiveExam')}</div>
                    <div className="text-3xl font-bold text-purple-900">{dashboardStats.pending_substantive_exam}</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.applicationsByStatus')}</h2>
                    <div className="space-y-3">
                        {Object.entries(dashboardStats.by_status).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    {t(`application.statuses.${status}`)}
                                </span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applications by Type */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.applicationsByType')}</h2>
                    <div className="space-y-3">
                        {Object.entries(dashboardStats.by_type).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-gray-700">
                                    {t(`application.appTypes.${type}`)}
                                </span>
                                <span className="font-semibold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.quickActions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/staff/applications"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.allApplications')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.allApplicationsDesc')}</p>
                    </a>

                    <a
                        href="/staff/applications/assigned"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.myApplications')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.myApplicationsDesc')}</p>
                    </a>

                    <a
                        href="/staff/reports"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.reports')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.reportsDesc')}</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
