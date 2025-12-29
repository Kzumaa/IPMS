import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAllRequests,
  deleteAmendment,
  deleteAssignment,
  deleteLicense,
  deleteSplit,
  deleteAppeal,
  submitAmendment,
  submitAssignment,
  submitLicense,
  submitSplit,
  submitAppeal,
} from '../store/requestSlice';
import RequestList from './RequestList';
import type { ApplicationRequest } from '../types/requestTypes';

interface RequestsSectionProps {
  applicationId: number;
  applicationStatus: string;
}

const RequestsSection: React.FC<RequestsSectionProps> = ({ applicationId, applicationStatus }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { requests, loading, submitting } = useAppSelector((state) => state.request);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRequests(applicationId));
  }, [applicationId, dispatch]);

  const handleDelete = async (request: ApplicationRequest) => {
    if (!window.confirm(t('request.confirm.delete'))) return;

    const deleteActions = {
      AMENDMENT: deleteAmendment,
      ASSIGNMENT: deleteAssignment,
      LICENSE: deleteLicense,
      SPLIT: deleteSplit,
      APPEAL: deleteAppeal,
    };

    const action = deleteActions[request.type as keyof typeof deleteActions];
    if (action) {
      await dispatch(action({ applicationId, requestId: request.id }));
    }
  };

  const handleSubmit = async (request: ApplicationRequest) => {
    if (!window.confirm(t('request.confirm.submit'))) return;

    const submitActions = {
      AMENDMENT: submitAmendment,
      ASSIGNMENT: submitAssignment,
      LICENSE: submitLicense,
      SPLIT: submitSplit,
      APPEAL: submitAppeal,
    };

    const action = submitActions[request.type as keyof typeof submitActions];
    if (action) {
      await dispatch(action({ applicationId, requestId: request.id }));
    }
  };

  const canCreateRequests = applicationStatus !== 'DRAFT';

  const requestTypes = [
    { type: 'amendments', label: t('request.types.AMENDMENT'), icon: 'edit_document' },
    { type: 'assignments', label: t('request.types.ASSIGNMENT'), icon: 'swap_horiz' },
    { type: 'licenses', label: t('request.types.LICENSE'), icon: 'license' },
    { type: 'splits', label: t('request.types.SPLIT'), icon: 'call_split' },
    { type: 'appeals', label: t('request.types.APPEAL'), icon: 'gavel' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('request.title')}
        </h3>
        {canCreateRequests && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined mr-1 !text-lg">add</span>
              {t('request.create')}
            </button>

            {showCreateMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCreateMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
                  <div className="py-1">
                    {requestTypes.map(({ type, label, icon }) => (
                      <Link
                        key={type}
                        to={`/app/applications/${applicationId}/requests/${type}/new`}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <span className="material-symbols-outlined mr-3 !text-lg">{icon}</span>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {!canCreateRequests && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mr-2 !text-lg">
              info
            </span>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('request.draftNotice')}
            </p>
          </div>
        </div>
      )}

      <RequestList
        applicationId={applicationId}
        requests={requests}
        loading={loading || submitting}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default RequestsSection;
