import React from 'react';
import { useTranslation } from 'react-i18next';

const StaffReportsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('staff.nav.reports')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {t('staff.reports.subtitle')}
                        </p>
                    </div>

                    {/* Coming Soon Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">
                            bar_chart
                        </span>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            {t('staff.reports.comingSoon')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {t('staff.reports.description')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StaffReportsPage;
