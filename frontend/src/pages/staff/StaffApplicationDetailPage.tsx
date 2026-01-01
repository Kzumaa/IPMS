import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApplication } from "@/features/application/store/applicationSlice";
import { ApplicationStatusBadge, ApplicationTimeline } from "@/features/application/components";
import ExaminationPanel from "@/features/staff/components/ExaminationPanel";
import ApplicationDocumentViewer from "@/features/staff/components/ApplicationDocumentViewer";

const formatDate = (dateString: string | null, language: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString(language === 'vi' ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const StaffApplicationDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentApplication, parties, attachments, loading, error } =
    useAppSelector((state) => state.application);
  console.log("Current Application:", currentApplication);

  useEffect(() => {
    if (id) {
      dispatch(fetchApplication(parseInt(id, 10)));
    }
  }, [id, dispatch]);

  const handleExaminationSuccess = () => {
    // Reload application data after successful examination action
    if (id) {
      dispatch(fetchApplication(parseInt(id, 10)));
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
          to="/staff/applications"
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
          to="/staff/applications"
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t("application.detail.backToList")}
        </Link>
      </div>
    );
  }

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
                to="/staff/applications"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentApplication.filing_number ||
                  t("application.detail.noNumber")}
              </h1>
              <ApplicationStatusBadge status={currentApplication.status} />
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {t("application.detail.filingDate")}:{" "}
              {formatDate(currentApplication.filing_date, i18n.language)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("application.detail.basicInfo")}
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {t("application.table.status")}
                </dt>
                <dd className="text-sm text-slate-900 dark:text-white mt-1">
                  {t(`application.statuses.${currentApplication.status}`)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("application.detail.filingDate")}
                </dt>
                <dd className="text-sm text-slate-900 dark:text-white mt-1">
                  {formatDate(currentApplication.filing_date, i18n.language)}
                </dd>
              </div>

              <div className="md:col-span-3">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("application.detail.title")}
                </dt>
                <dd className="text-sm text-slate-900 dark:text-white mt-1">
                  {currentApplication.title}
                </dd>
              </div>
            </dl>
          </div>

          {/* Document Viewer */}
          {currentApplication.id && attachments.length > 0 && (
            <ApplicationDocumentViewer
              attachments={attachments}
              applicationId={currentApplication.id}
            />
          )}

          {/* Parties Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("application.detail.parties")}
            </h3>

            <div className="space-y-4">
              {/* Applicants */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t("application.partyTypes.APPLICANT")} ({applicants.length})
                </h4>
                <div className="space-y-2">
                  {applicants.map((party) => (
                    <div key={party.id} className="text-sm">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {party.name}
                      </p>
                      {party.email && (
                        <p className="text-slate-500 dark:text-slate-400">
                          {party.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventors */}
              {inventors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {t("application.partyTypes.INVENTOR")} ({inventors.length})
                  </h4>
                  <div className="space-y-2">
                    {inventors.map((party) => (
                      <div key={party.id} className="text-sm">
                        <p className="text-slate-900 dark:text-white">
                          {party.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Representatives */}
              {representatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {t("application.partyTypes.REPRESENTATIVE")} (
                    {representatives.length})
                  </h4>
                  <div className="space-y-2">
                    {representatives.map((party) => (
                      <div key={party.id} className="text-sm">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {party.name}
                        </p>
                        {party.email && (
                          <p className="text-slate-500 dark:text-slate-400">
                            {party.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Examination Panel */}
          {currentApplication.id && (
            <ExaminationPanel
              application={currentApplication}
              parties={parties}
              attachments={attachments}
              onSuccess={handleExaminationSuccess}
            />
          )}

          {/* Application Timeline */}
          {currentApplication.id && (
            <ApplicationTimeline applicationId={currentApplication.id} />
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffApplicationDetailPage;
