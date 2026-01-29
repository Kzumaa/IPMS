import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchRequest,
  deleteAmendment,
  deleteAssignment,
  deleteLicense,
  deleteSplit,
  submitAmendment,
  submitAssignment,
  submitLicense,
  submitSplit,
} from '../../features/request/store/requestSlice';
import { RequestDetail } from '../../features/request/components';
import type { RequestType } from '../../features/request/types/enums';

const typeFromSlug = (slug: string): RequestType => {
  const mapping: Record<string, RequestType> = {
    amendments: 'AMENDMENT',
    assignments: 'ASSIGNMENT',
    licenses: 'LICENSE',
    splits: 'SPLIT',
  };
  return mapping[slug] || 'AMENDMENT';
};

const RequestDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id, type, requestId } = useParams<{ id: string; type: string; requestId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRequest, loading, submitting, error } = useAppSelector((state) => state.request);

  const applicationId = parseInt(id || '0', 10);
  const reqId = parseInt(requestId || '0', 10);
  const requestType = typeFromSlug(type || 'amendments');

  useEffect(() => {
    if (applicationId && reqId) {
      dispatch(fetchRequest({ applicationId, requestId: reqId, type: requestType }));
    }
  }, [applicationId, reqId, requestType, dispatch]);

  const handleDelete = async () => {
    if (!currentRequest || !window.confirm(t('request.confirm.delete'))) return;

    const deleteActions = {
      AMENDMENT: deleteAmendment,
      ASSIGNMENT: deleteAssignment,
      LICENSE: deleteLicense,
      SPLIT: deleteSplit,
    };

    const action = deleteActions[currentRequest.type as keyof typeof deleteActions];
    if (action) {
      const result = await dispatch(action({ applicationId, requestId: reqId }));
      if (result.meta.requestStatus === 'fulfilled') {
        navigate(`/app/applications/${applicationId}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentRequest || !window.confirm(t('request.confirm.submit'))) return;

    const submitActions = {
      AMENDMENT: submitAmendment,
      ASSIGNMENT: submitAssignment,
      LICENSE: submitLicense,
      SPLIT: submitSplit,
    };

    const action = submitActions[currentRequest.type as keyof typeof submitActions];
    if (action) {
      await dispatch(action({ applicationId, requestId: reqId }));
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {t('request.loadError')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <Link
          to={`/app/applications/${applicationId}`}
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t('request.backToApplication')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/app/applications/${applicationId}`}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('request.detail')}
          </h1>
        </div>

        {currentRequest ? (
          <div className="max-w-4xl">
            <RequestDetail
              request={currentRequest}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              loading={loading}
              submitting={submitting}
            />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-8">
            <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
              refresh
            </span>
            <span className="text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
              search_off
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('request.notFound')}
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestDetailPage;
