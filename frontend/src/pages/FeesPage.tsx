import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchApplications } from "../features/application/store/applicationSlice";
import { fetchMyPayments } from "../features/payment/store/paymentSlice";
import {
  PaymentButton,
  PaymentStatusBadge,
} from "../features/payment/components";
import type { FeeQuote } from "../features/application/types/applicationTypes";
import type { Payment } from "../features/payment/types/paymentTypes";

interface FeeQuoteWithApplication extends FeeQuote {
  filing_number?: string | null;
  application_title?: string;
}

const FeesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { applications, loading: appLoading } = useAppSelector(
    (state) => state.application,
  );
  const { payments, loading: paymentLoading } = useAppSelector(
    (state) => state.payment,
  );

  const [activeTab, setActiveTab] = useState<"unpaid" | "paid" | "history">(
    "unpaid",
  );

  useEffect(() => {
    dispatch(fetchApplications({ page: 1, per_page: 100 }));
    dispatch(fetchMyPayments());
  }, [dispatch]);

  // Extract and categorize fee quotes from applications
  const { unpaidQuotes, paidQuotes, stats } = useMemo(() => {
    const unpaid: FeeQuoteWithApplication[] = [];
    const paid: FeeQuoteWithApplication[] = [];
    let totalUnpaid = 0;
    let totalPaid = 0;

    applications.forEach((app) => {
      if (app.fee_quotes && app.fee_quotes.length > 0) {
        app.fee_quotes.forEach((quote) => {
          const quoteWithApp: FeeQuoteWithApplication = {
            ...quote,
            filing_number: app.filing_number || `APP-${app.id}`,
            application_title: app.title,
          };

          if (quote.status === "PAID") {
            paid.push(quoteWithApp);
            totalPaid += parseFloat(String(quote.total_amount)) || 0;
          } else if (quote.status === "PENDING") {
            unpaid.push(quoteWithApp);
            totalUnpaid += parseFloat(String(quote.total_amount)) || 0;
          }
        });
      }
    });

    return {
      unpaidQuotes: unpaid,
      paidQuotes: paid,
      stats: {
        unpaidCount: unpaid.length,
        paidCount: paid.length,
        totalUnpaid,
        totalPaid,
        paymentCount: payments.length,
      },
    };
  }, [applications, payments.length]);

  const formatCurrency = (amount: number, currency: string = "VND") => {
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale).format(amount) + " " + currency;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loading = appLoading || paymentLoading;

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
            {t("dashboard.nav.feeManagement")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">
            {t(
              "payment.pageDescription",
              "Track and pay your IP application and maintenance fees.",
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#111521] p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${stats.unpaidCount > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}
            >
              <span className="material-symbols-outlined text-xl">
                pending_actions
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("payment.unpaidFees")}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {loading ? "..." : formatCurrency(stats.totalUnpaid)}
              </p>
              <p className="text-xs text-slate-400">
                {stats.unpaidCount} {t('payment.feeItems')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111521] p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-xl">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("payment.paidFees")}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {loading ? "..." : formatCurrency(stats.totalPaid)}
              </p>
              <p className="text-xs text-slate-400">
                {stats.paidCount} {t('payment.feeItems')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111521] p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined text-xl">
                receipt_long
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("payment.paymentHistory")}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {loading ? "..." : stats.paymentCount}
              </p>
              <p className="text-xs text-slate-400">
                {t("payment.transactions", "transactions")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("unpaid")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "unpaid"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            {t("payment.unpaidFees")}
            {stats.unpaidCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.unpaidCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "paid"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            {t("payment.paidFees")}
            {stats.paidCount > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.paidCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "history"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
          >
            {t("payment.paymentHistory")}
            {stats.paymentCount > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.paymentCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
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
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            {t("common.loading")}
          </span>
        </div>
      ) : (
        <>
          {/* Unpaid Fees Tab */}
          {activeTab === "unpaid" && (
            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              {unpaidQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-5xl text-green-500 mb-4">
                    check_circle
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t("payment.noUnpaidFees")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3">
                          {t("application.table.filingNumber")}
                        </th>
                        <th className="px-6 py-3">
                          {t("application.steps.review.feeDescription")}
                        </th>
                        <th className="px-6 py-3">{t("payment.amount")}</th>
                        <th className="px-6 py-3">{t("payment.status")}</th>
                        <th className="px-6 py-3">
                          <span className="sr-only">{t("common.actions")}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unpaidQuotes.map((quote) => (
                        <tr
                          key={quote.id}
                          className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/app/applications/${quote.application_id}`}
                              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              {quote.filing_number}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                              {quote.application_title}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {t("payment.applicationFee")} v{quote.version}
                            {quote.lines && quote.lines.length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">
                                {quote.lines.length} {t('payment.feeItems')}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(quote.total_amount, quote.currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              {quote.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <PaymentButton
                              feeQuoteId={quote.id}
                              amount={quote.total_amount}
                              currency={quote.currency}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Paid Fees Tab */}
          {activeTab === "paid" && (
            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              {paidQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
                    receipt_long
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t("payment.noPayments")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3">
                          {t("application.table.filingNumber")}
                        </th>
                        <th className="px-6 py-3">
                          {t("application.steps.review.feeDescription")}
                        </th>
                        <th className="px-6 py-3">{t("payment.amount")}</th>
                        <th className="px-6 py-3">{t("payment.status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidQuotes.map((quote) => (
                        <tr
                          key={quote.id}
                          className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/app/applications/${quote.application_id}`}
                              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              {quote.filing_number}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                              {quote.application_title}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {t("payment.applicationFee")} v{quote.version}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(quote.total_amount, quote.currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              <span className="material-symbols-outlined mr-1 !text-sm">
                                check_circle
                              </span>
                              {t("payment.statuses.COMPLETED")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
                    history
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t("payment.noPayments")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">
                          {t("application.steps.review.feeDescription")}
                        </th>
                        <th className="px-6 py-3">{t("payment.amount")}</th>
                        <th className="px-6 py-3">{t("payment.status")}</th>
                        <th className="px-6 py-3">{t("payment.paidAt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment: Payment) => (
                        <tr
                          key={payment.id}
                          className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            #{payment.id}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {payment.description ||
                                `Payment for Application #${payment.application_id}`}
                            </div>
                            {payment.application_id && (
                              <Link
                                to={`/app/applications/${payment.application_id}`}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {t("payment.viewApplication")}
                              </Link>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(
                              Number(payment.amount),
                              payment.currency?.toUpperCase() || "VND",
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <PaymentStatusBadge
                              status={payment.status}
                              size="sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            {formatDate(payment.paid_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeesPage;
