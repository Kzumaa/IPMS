import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ApplicationRequest } from '../types/requestTypes';
import RequestStatusBadge from './RequestStatusBadge';
import RequestTypeBadge from './RequestTypeBadge';

interface RequestListProps {
  applicationId: number;
  requests: ApplicationRequest[];
  loading?: boolean;
  onDelete?: (request: ApplicationRequest) => void;
  onSubmit?: (request: ApplicationRequest) => void;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getRequestTypeSlug = (type: string): string => {
  const slugs: Record<string, string> = {
    AMENDMENT: 'amendments',
    ASSIGNMENT: 'assignments',
    LICENSE: 'licenses',
    SPLIT: 'splits',
    APPEAL: 'appeals',
    WITHDRAWAL: 'withdrawals',
    COMPLAINT: 'complaints',
  };
  return slugs[type] || 'amendments';
};

const RequestList: React.FC<RequestListProps> = ({
  applicationId,
  requests,
  loading = false,
  onDelete,
  onSubmit,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
            refresh
          </span>
          <span className="text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
          folder_open
        </span>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          {t('request.noRequests')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {t('request.noRequestsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('request.table.id')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('request.table.type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('request.table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('request.table.status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('request.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/app/applications/${applicationId}/requests/${getRequestTypeSlug(request.type)}/${request.id}`}
                    className="text-sm font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    #{request.id}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <RequestTypeBadge type={request.type} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(request.request_date || request.created_at)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/app/applications/${applicationId}/requests/${getRequestTypeSlug(request.type)}/${request.id}`}
                      className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title={t('common.view')}
                    >
                      <span className="material-symbols-outlined !text-xl">visibility</span>
                    </Link>
                    {request.can_edit && (
                      <Link
                        to={`/app/applications/${applicationId}/requests/${getRequestTypeSlug(request.type)}/${request.id}/edit`}
                        className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title={t('common.edit')}
                      >
                        <span className="material-symbols-outlined !text-xl">edit</span>
                      </Link>
                    )}
                    {request.can_submit && onSubmit && (
                      <button
                        type="button"
                        onClick={() => onSubmit(request)}
                        className="p-1 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title={t('request.submit')}
                      >
                        <span className="material-symbols-outlined !text-xl">send</span>
                      </button>
                    )}
                    {request.can_edit && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(request)}
                        className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title={t('common.delete')}
                      >
                        <span className="material-symbols-outlined !text-xl">delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList;
