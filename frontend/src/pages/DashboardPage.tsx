import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchApplications } from '../features/application/store/applicationSlice';
import { ApplicationStatus } from '../features/application/types/enums';

const DashboardPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const { applications, loading } = useAppSelector(state => state.application);

    useEffect(() => {
        dispatch(fetchApplications({ page: 1, per_page: 100 }));
    }, [dispatch]);

    // Calculate statistics from real data
    const stats = useMemo(() => {
        // In-progress statuses - applications that are actively being processed
        const inProgressStatuses = [
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.FORMALITY_EXAM,
            ApplicationStatus.FORMALITY_PASSED,
            ApplicationStatus.PUBLISHED,
            ApplicationStatus.SUB_EXAM,
            ApplicationStatus.WAITING_FOR_PAYMENT
        ];
        const inProgressApplications = applications.filter(app => inProgressStatuses.includes(app.status as ApplicationStatus));

        // Granted applications - successfully protected IP
        const grantedApplications = applications.filter(app => app.status === ApplicationStatus.GRANTED);

        let totalUnpaidAmount = 0;
        let unpaidCount = 0;

        applications.forEach(app => {
            if (app.fee_quotes) {
                app.fee_quotes.forEach(quote => {
                    if (quote.status === 'FINAL' || quote.status === 'DRAFT') {
                        totalUnpaidAmount += quote.total_amount;
                        unpaidCount++;
                    }
                });
            }
        });

        return {
            inProgressApplications: inProgressApplications.length,
            grantedApplications: grantedApplications.length,
            totalApplications: applications.length,
            unpaidAmount: totalUnpaidAmount,
            unpaidCount
        };
    }, [applications]);

    // Get recent applications for activity feed
    const recentApplications = useMemo(() => {
        return [...applications]
            .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
            .slice(0, 5);
    }, [applications]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case ApplicationStatus.DRAFT:
                return { icon: 'edit_note', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' };
            case ApplicationStatus.SUBMITTED:
            case ApplicationStatus.WAITING_FOR_PAYMENT:
                return { icon: 'send', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' };
            case ApplicationStatus.FORMALITY_EXAM:
            case ApplicationStatus.SUB_EXAM:
                return { icon: 'pending', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
            case ApplicationStatus.FORMALITY_PASSED:
            case ApplicationStatus.PUBLISHED:
                return { icon: 'check_circle', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
            case ApplicationStatus.GRANTED:
                return { icon: 'workspace_premium', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
            case ApplicationStatus.DECLINED:
                return { icon: 'cancel', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
            default:
                return { icon: 'description', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' };
        }
    };

    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="mb-6">
                <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">{t('dashboard.nav.dashboard')}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">{t('dashboard.subtitle')}</p>
            </div>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link to="/app/applications" className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.inProgressApplications')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : stats.inProgressApplications}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                {t('dashboard.grantedCount', { count: stats.grantedApplications })} • {t('dashboard.totalLabel', { count: stats.totalApplications })}
                            </p>
                        </div>
                    </div>
                </Link>

                <div className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined">event</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('dashboard.upcomingDeadlines')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">-</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{t('dashboard.noDeadlines')}</p>
                        </div>
                    </div>
                </div>

                <Link to="/app/fees" className="bg-white dark:bg-[#111521] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stats.unpaidCount > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('payment.unpaidFees')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : (stats.unpaidAmount > 0 ? formatCurrency(stats.unpaidAmount) : t('payment.noUnpaidFees'))}
                            </h3>
                            {stats.unpaidCount > 0 && (
                                <p className="text-xs text-red-500 dark:text-red-400">
                                    {stats.unpaidCount} {t('payment.unpaidFees').toLowerCase()}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#111521] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.recentActivity')}</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : recentApplications.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">{t('dashboard.noRecentActivity')}</p>
                    ) : (
                        <div className="space-y-6">
                            {recentApplications.map((app) => {
                                const statusInfo = getStatusIcon(app.status);
                                return (
                                    <Link key={app.id} to={`/app/applications/${app.id}`} className="flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                                            <span className="material-symbols-outlined text-xl">{statusInfo.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {app.filing_number || app.title || t('application.detail.title')}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {t(`application.statuses.${app.status}`)} • {t(`application.appTypes.${app.app_type}`)}
                                            </p>
                                            <span className="text-xs text-slate-400 mt-1 block">
                                                {formatDate(app.updated_at || app.created_at)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
