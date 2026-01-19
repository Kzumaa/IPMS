import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PaymentCancelPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                <span className="material-symbols-outlined text-6xl text-amber-600">
                    cancel
                </span>
                <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                    {t('payment.cancel.title')}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {t('payment.cancel.message')}
                </p>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        {t('payment.cancel.noCharge')}
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    <Link
                        to="/app/fees"
                        className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {t('payment.tryAgain')}
                    </Link>
                    <Link
                        to="/app/dashboard"
                        className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        {t('common.backToDashboard')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelPage;
