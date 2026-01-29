import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/features/staff/store/staffSlice';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Color palettes for charts
const STATUS_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
];

const TYPE_COLORS = ['#6366f1', '#22c55e', '#eab308'];

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

    // Transform data for charts
    const statusData = Object.entries(dashboardStats.by_status).map(([status, count]) => ({
        name: t(`application.statuses.${status}`),
        value: count,
        key: status,
    }));

    const typeData = Object.entries(dashboardStats.by_type).map(([type, count]) => ({
        name: t(`application.appTypes.${type}`),
        value: count,
        key: type,
    }));

    const classData = dashboardStats.by_class || [];

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Applications by Status - Pie Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.applicationsByStatus')}</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                    }
                                >
                                    {statusData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Applications by Type - Pie Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.applicationsByType')}</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                    }
                                >
                                    {typeData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Applications by Classification - Bar Chart */}
            {classData.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.applicationsByClass')}</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={classData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={70} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#6366f1" name={t('staff.dashboard.count')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">{t('staff.dashboard.quickActions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/staff/published"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.publishedApplications')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.publishedApplicationsDesc')}</p>
                    </a>

                    <a
                        href="/staff/applications/assigned"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.myApplications')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.myApplicationsDesc')}</p>
                    </a>

                    <a
                        href="/staff/requests"
                        className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                        <h3 className="font-semibold text-gray-900 mb-1">{t('staff.dashboard.requests')}</h3>
                        <p className="text-sm text-gray-600">{t('staff.dashboard.requestsDesc')}</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
