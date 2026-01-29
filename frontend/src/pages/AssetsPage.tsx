import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchGrantedTitles,
  fetchLicensedTitles,
  setActiveTab,
} from '../features/title/store/titleSlice';
import { AppTypeLabels } from '../features/application/types/enums';
import type { Application } from '../features/application/types/applicationTypes';

const AssetsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { ownedTitles, licensedTitles, loading, error, activeTab } = useAppSelector(
    (state) => state.title
  );

  useEffect(() => {
    dispatch(fetchGrantedTitles());
    dispatch(fetchLicensedTitles());
  }, [dispatch]);

  const currentTitles = activeTab === 'owned' ? ownedTitles : licensedTitles;

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if expiry is within 6 months (warning)
  const isExpiryWarning = (expiryDate: string | null | undefined): boolean => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return false;
    return days > 0 && days <= 180; // 6 months
  };

  // Check if expired
  const isExpired = (expiryDate: string | null | undefined): boolean => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return false;
    return days <= 0;
  };

  // Format date
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string | undefined): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  // Get license info for licensed titles
  const getLicenseInfo = (app: Application) => {
    if (!app.requests || app.requests.length === 0) return null;
    const licenseRequest = app.requests.find(
      (r) => r.type === 'LICENSE' && r.status === 'APPROVED' && r.license
    );
    return licenseRequest?.license || null;
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
            {t('assets.title', 'My IP Assets')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-1">
            {t('assets.description', 'View and manage your granted intellectual property rights.')}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => dispatch(setActiveTab('owned'))}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'owned'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-lg">verified</span>
                {t('assets.tabs.myTitles', 'My Titles')}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {ownedTitles.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => dispatch(setActiveTab('licensed'))}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'licensed'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-lg">license</span>
                {t('assets.tabs.licensedToMe', 'Licensed to Me')}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {licensedTitles.length}
                </span>
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="material-symbols-outlined animate-spin text-indigo-500 !text-4xl">
            progress_activity
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentTitles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 !text-6xl mb-4">
            {activeTab === 'owned' ? 'workspace_premium' : 'license'}
          </span>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {activeTab === 'owned'
              ? t('assets.empty.owned.title', 'No granted titles yet')
              : t('assets.empty.licensed.title', 'No licensed titles yet')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            {activeTab === 'owned'
              ? t(
                  'assets.empty.owned.description',
                  'Your granted intellectual property titles will appear here once your applications are approved.'
                )
              : t(
                  'assets.empty.licensed.description',
                  'Titles that others have licensed to you will appear here.'
                )}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && currentTitles.length > 0 && (
        <div className="bg-white dark:bg-[#111521] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3">
                    {t('assets.table.registrationNumber', 'Registration No.')}
                  </th>
                  <th className="px-6 py-3">{t('assets.table.title', 'Title')}</th>
                  <th className="px-6 py-3">{t('assets.table.type', 'Type')}</th>
                  <th className="px-6 py-3">{t('assets.table.issueDate', 'Issue Date')}</th>
                  <th className="px-6 py-3">{t('assets.table.expiryDate', 'Expiry Date')}</th>
                  {activeTab === 'licensed' && (
                    <th className="px-6 py-3">{t('assets.table.licenseInfo', 'License Info')}</th>
                  )}
                  <th className="px-6 py-3">{t('assets.table.status', 'Status')}</th>
                  <th className="px-6 py-3">
                    <span className="sr-only">{t('common.actions', 'Actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTitles.map((app) => {
                  const protectionTitle = app.protection_title;
                  const licenseInfo = activeTab === 'licensed' ? getLicenseInfo(app) : null;
                  const expiryDate = app.expiry_date || protectionTitle?.expiry_date;
                  const issueDate = app.issue_date || protectionTitle?.issue_date;
                  const regNumber = app.registration_number || protectionTitle?.registration_number || app.filing_number || '-';
                  const titleStatus = protectionTitle?.status || 'ACTIVE'; // Fallback to ACTIVE if no protection title status

                  const expiryWarning = isExpiryWarning(expiryDate);
                  const expired = isExpired(expiryDate);

                  return (
                    <tr
                      key={app.id}
                      className="bg-white dark:bg-[#111521] border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {regNumber}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={app.title}>
                        {app.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                          {AppTypeLabels[app.app_type] || app.app_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDate(issueDate)}</td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          expired
                            ? 'text-red-600 dark:text-red-400'
                            : expiryWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : ''
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {formatDate(expiryDate)}
                          {expiryWarning && (
                            <span
                              className="material-symbols-outlined !text-base"
                              title={t('assets.expiryWarning', 'Expiring soon')}
                            >
                              warning
                            </span>
                          )}
                          {expired && (
                            <span
                              className="material-symbols-outlined !text-base"
                              title={t('assets.expired', 'Expired')}
                            >
                              error
                            </span>
                          )}
                        </span>
                      </td>
                      {activeTab === 'licensed' && (
                        <td className="px-6 py-4 text-xs">
                          {licenseInfo ? (
                            <div className="space-y-1">
                              <div>
                                <span className="text-slate-400">
                                  {t('assets.license.type', 'Type')}:
                                </span>{' '}
                                {licenseInfo.license_type === 'EXCLUSIVE'
                                  ? t('assets.license.exclusive', 'Exclusive')
                                  : t('assets.license.nonExclusive', 'Non-Exclusive')}
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  {t('assets.license.validUntil', 'Valid until')}:
                                </span>{' '}
                                {formatDate(licenseInfo.valid_to)}
                              </div>
                              {licenseInfo.licensor && (
                                <div>
                                  <span className="text-slate-400">
                                    {t('assets.license.from', 'From')}:
                                  </span>{' '}
                                  {licenseInfo.licensor.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            titleStatus
                          )}`}
                        >
                          {titleStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/app/applications/${app.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            title={t('common.view', 'View')}
                          >
                            <span className="material-symbols-outlined !text-lg">visibility</span>
                          </Link>
                          {activeTab === 'owned' && (
                            <Link
                              to={`/app/applications/${app.id}/requests/licenses/new`}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                              title={t('assets.createLicense', 'Create License')}
                            >
                              <span className="material-symbols-outlined !text-lg">
                                add_circle
                              </span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
