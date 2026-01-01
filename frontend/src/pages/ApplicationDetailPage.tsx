import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchApplication,
  deleteApplication,
} from "../features/application/store/applicationSlice";
import {
  ApplicationStatusBadge,
  ApplicantDocumentViewer,
  ApplicationTimeline,
} from "../features/application/components";
import { RequestsSection } from "../features/request/components";
import { PaymentButton } from "../features/payment/components";

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ApplicationDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentApplication, parties, attachments, loading, error } =
    useAppSelector((state) => state.application);

  console.log(currentApplication);

  useEffect(() => {
    if (id) {
      dispatch(fetchApplication(parseInt(id, 10)));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!currentApplication?.id) return;

    if (window.confirm(t("application.confirm.delete"))) {
      const result = await dispatch(deleteApplication(currentApplication.id));
      if (deleteApplication.fulfilled.match(result)) {
        navigate("/app/applications");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
          refresh
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {t("application.loading")}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">
          error
        </span>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {t("application.detail.loadError")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <Link
          to="/app/applications"
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t("application.detail.backToList")}
        </Link>
      </div>
    );
  }

  if (!currentApplication) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
          search_off
        </span>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {t("application.detail.notFound")}
        </h2>
        <Link
          to="/app/applications"
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t("application.detail.backToList")}
        </Link>
      </div>
    );
  }

  console.log(currentApplication);

  const applicants = parties.filter((p) => p.party_type === "APPLICANT");
  const inventors = parties.filter((p) => p.party_type === "INVENTOR");
  const representatives = parties.filter(
    (p) => p.party_type === "REPRESENTATIVE"
  );

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/app/applications"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentApplication.filing_number ||
                  `${t("application.title")} #${currentApplication.id}`}
              </h1>
              <ApplicationStatusBadge
                status={currentApplication.status}
                size="lg"
              />
            </div>
            <p className="text-slate-500 dark:text-slate-400 ml-10">
              {currentApplication.title}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {currentApplication.status === "DRAFT" && (
              <>
                <Link
                  to={`/app/applications/${currentApplication.id}/edit`}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 !text-lg">
                    edit
                  </span>
                  {t("application.detail.edit")}
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 !text-lg">
                    delete
                  </span>
                  {t("application.detail.delete")}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t("application.detail.basicInfo")}
              </h3>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("application.table.appType")}
                  </dt>
                  <dd className="text-sm text-slate-900 dark:text-white mt-1">
                    {t(`application.appTypes.${currentApplication.app_type}`)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("application.detail.filingDate")}
                  </dt>
                  <dd className="text-sm text-slate-900 dark:text-white mt-1">
                    {formatDate(currentApplication.filing_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("application.detail.pctApplication")}
                  </dt>
                  <dd className="text-sm text-slate-900 dark:text-white mt-1">
                    {currentApplication.is_pct
                      ? `${t("common.yes")} (${
                          currentApplication.pct_number || "-"
                        })`
                      : t("common.no")}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("application.detail.createdAt")}
                  </dt>
                  <dd className="text-sm text-slate-900 dark:text-white mt-1">
                    {formatDate(currentApplication.created_at)}
                  </dd>
                </div>

                {currentApplication.priority_number && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("application.detail.priority")}
                    </dt>
                    <dd className="text-sm text-slate-900 dark:text-white mt-1">
                      {currentApplication.priority_number} (
                      {currentApplication.priority_country}) -{" "}
                      {formatDate(currentApplication.priority_date)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Note: Abstract, description, and claims are uploaded as attachments */}

            {/* Requests Section */}
            <RequestsSection
              applicationId={currentApplication.id!}
              applicationStatus={currentApplication.status}
            />

            {/* Application Timeline */}
            <ApplicationTimeline applicationId={currentApplication.id!} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t("application.detail.parties")}
              </h3>

              <div className="space-y-4">
                {/* Applicants */}
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {t("application.partyTypes.APPLICANT")} ({applicants.length}
                    )
                  </h4>
                  {applicants.length > 0 ? (
                    <ul className="space-y-2">
                      {applicants.map((party) => (
                        <li
                          key={party.id}
                          className="text-sm text-slate-900 dark:text-white"
                        >
                          <strong>{party.name}</strong>
                          {party.email && (
                            <span className="text-slate-500 dark:text-slate-400 block text-xs">
                              {party.email}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      -
                    </p>
                  )}
                </div>

                {/* Inventors */}
                {inventors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      {t("application.partyTypes.INVENTOR")} ({inventors.length}
                      )
                    </h4>
                    <ul className="space-y-1">
                      {inventors.map((party) => (
                        <li
                          key={party.id}
                          className="text-sm text-slate-900 dark:text-white"
                        >
                          {party.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Representatives */}
                {representatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      {t("application.partyTypes.REPRESENTATIVE")} (
                      {representatives.length})
                    </h4>
                    <ul className="space-y-1">
                      {representatives.map((party) => (
                        <li
                          key={party.id}
                          className="text-sm text-slate-900 dark:text-white"
                        >
                          {party.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Payment */}
            {currentApplication.fee_quotes && currentApplication.fee_quotes.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t("payment.feePayment")}
                  </h3>
                  <Link
                    to="/app/fees"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {t("payment.viewAll")}
                  </Link>
                </div>
                <div className="space-y-3">
                  {currentApplication.fee_quotes.map((quote) => {
                    const isPaid = quote.status === "PAID";
                    const isPayable = quote.status === "FINAL" || quote.status === "DRAFT";
                    return (
                      <div
                        key={quote.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {t("payment.applicationFee")} v{quote.version}
                          </p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat("vi-VN").format(quote.total_amount)} {quote.currency}
                          </p>
                        </div>
                        <div>
                          {isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              <span className="material-symbols-outlined mr-1 !text-sm">check_circle</span>
                              {t("payment.statuses.PAID")}
                            </span>
                          ) : isPayable ? (
                            <PaymentButton
                              feeQuoteId={quote.id}
                              amount={quote.total_amount}
                              currency={quote.currency}
                              size="sm"
                            />
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                              {quote.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t("application.detail.attachments")} ({attachments.length})
              </h3>

              <ApplicantDocumentViewer
                attachments={attachments}
                applicationId={currentApplication.id!}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDetailPage;
