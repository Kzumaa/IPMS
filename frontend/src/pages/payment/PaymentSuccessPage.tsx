import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPaymentStatus, clearCurrentPayment } from '../../features/payment/store/paymentSlice';
import { PaymentStatusBadge } from '../../features/payment/components';

const PaymentSuccessPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const { currentPayment, loading, error } = useAppSelector(state => state.payment);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            dispatch(fetchPaymentStatus(sessionId));
        }

        return () => {
            dispatch(clearCurrentPayment());
        };
    }, [dispatch, sessionId]);

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                    <span className="material-symbols-outlined text-6xl text-red-600">
                        error
                    </span>
                    <p className="mt-4 text-red-600">{t('payment.invalidSession')}</p>
                    <Link
                        to="/app/dashboard"
                        className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {t('common.backToDashboard')}
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                    <svg
                        className="animate-spin h-16 w-16 text-indigo-600 mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">{t('payment.verifying')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                    <span className="material-symbols-outlined text-6xl text-red-600">
                        error
                    </span>
                    <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                        {t('payment.error.title')}
                    </h1>
                    <p className="mt-2 text-red-600">{error}</p>
                    <Link
                        to="/app/dashboard"
                        className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {t('common.backToDashboard')}
                    </Link>
                </div>
            </div>
        );
    }

    const formattedAmount = currentPayment
        ? new Intl.NumberFormat('vi-VN').format(Number(currentPayment.amount))
        : '';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
                <span className="material-symbols-outlined text-6xl text-green-600">
                    check_circle
                </span>
                <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                    {t('payment.success.title')}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {t('payment.success.message')}
                </p>

                {currentPayment && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg text-left">
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <dt className="text-slate-500 dark:text-slate-400">{t('payment.amount')}:</dt>
                                <dd className="font-medium text-slate-900 dark:text-white">
                                    {formattedAmount} {currentPayment.currency?.toUpperCase()}
                                </dd>
                            </div>
                            <div className="flex justify-between items-center">
                                <dt className="text-slate-500 dark:text-slate-400">{t('payment.status')}:</dt>
                                <dd>
                                    <PaymentStatusBadge status={currentPayment.status} size="sm" />
                                </dd>
                            </div>
                            {currentPayment.paid_at && (
                                <div className="flex justify-between items-center">
                                    <dt className="text-slate-500 dark:text-slate-400">{t('payment.paidAt')}:</dt>
                                    <dd className="font-medium text-slate-900 dark:text-white">
                                        {new Date(currentPayment.paid_at).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}

                <div className="mt-6 space-y-3">
                    {currentPayment?.application_id && (
                        <Link
                            to={`/app/applications/${currentPayment.application_id}`}
                            className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {t('payment.viewApplication')}
                        </Link>
                    )}
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

export default PaymentSuccessPage;
