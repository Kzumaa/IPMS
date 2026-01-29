import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchAllRequests,
  deleteAmendment,
  deleteAssignment,
  deleteLicense,
  deleteSplit,
  deleteWithdrawal,
  deleteComplaint,
  submitAmendment,
  submitAssignment,
  submitLicense,
  submitSplit,
  submitWithdrawal,
  submitComplaint,
} from '../store/requestSlice';
import RequestList from './RequestList';
import type { ApplicationRequest } from '../types/requestTypes';
import { ApplicationStatus } from '../../application/types/enums';

interface RequestsSectionProps {
  applicationId: number;
  applicationStatus: string;
  canAddRequest?: boolean;
}

// Maximum complaints allowed per application
const MAX_COMPLAINTS = 3;

const RequestsSection: React.FC<RequestsSectionProps> = ({ applicationId, applicationStatus, canAddRequest = true }) => {
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
      WITHDRAWAL: deleteWithdrawal,
      COMPLAINT: deleteComplaint,
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
      WITHDRAWAL: submitWithdrawal,
      COMPLAINT: submitComplaint,
    };

    const action = submitActions[request.type as keyof typeof submitActions];
    if (action) {
      await dispatch(action({ applicationId, requestId: request.id }));
    }
  };

  const canCreateRequests = applicationStatus !== 'DRAFT' && canAddRequest;

  // Calculate complaint count for validation
  const complaintCount = useMemo(() => {
    return requests.filter((r) => r.type === 'COMPLAINT').length;
  }, [requests]);

  const remainingComplaints = MAX_COMPLAINTS - complaintCount;

  // Complaint available when application is DECLINED (different from REFUSED which is for appeals)
  const complainableStatuses: string[] = [
    ApplicationStatus.DECLINED,
    ApplicationStatus.COMPLAINING,
    ApplicationStatus.CHECKING_COMPLAINT,
  ];
  const canComplain = remainingComplaints > 0 && complainableStatuses.includes(applicationStatus);

  // License only available for GRANTED applications
  const canLicense = applicationStatus === ApplicationStatus.GRANTED;

  // Pre-grant statuses that allow withdrawal
  const preGrantStatuses: string[] = [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.FORMALITY_CHECKING,
    ApplicationStatus.FORMALITY_PASSED,
    ApplicationStatus.PUBLISHED,
    ApplicationStatus.SUBSTANTIVE_CHECKING,
  ];
  const canWithdraw = preGrantStatuses.includes(applicationStatus);

  // Terminal/non-modifiable statuses
  const terminalStatuses: string[] = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.GRANTED,
    ApplicationStatus.REFUSED,
    ApplicationStatus.WITHDRAWN,
  ];

  // Split only available for non-terminal, non-draft statuses
  const canSplit = !terminalStatuses.includes(applicationStatus);

  // Amendment available for submitted, non-terminal statuses
  const canAmend = !terminalStatuses.includes(applicationStatus);

  // Assignment available for non-draft, non-withdrawn statuses
  const nonAssignableStatuses: string[] = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.WITHDRAWN,
  ];
  const canAssign = !nonAssignableStatuses.includes(applicationStatus);

  const requestTypes = useMemo(() => {
    const types = [];

    if (canAmend) {
      types.push({ type: 'amendments', label: t('request.types.AMENDMENT'), icon: 'edit_document' });
    }
    if (canAssign) {
      types.push({ type: 'assignments', label: t('request.types.ASSIGNMENT'), icon: 'swap_horiz' });
    }
    if (canLicense) {
      types.push({ type: 'licenses', label: t('request.types.LICENSE'), icon: 'license' });
    }
    if (canSplit) {
      types.push({ type: 'splits', label: t('request.types.SPLIT'), icon: 'call_split' });
    }
    if (canWithdraw) {
      types.push({
        type: 'withdrawals',
        label: t('request.types.WITHDRAWAL'),
        icon: 'undo',
      });
    }
    if (canComplain) {
      types.push({
        type: 'complaints',
        label: `${t('request.types.COMPLAINT')} (${remainingComplaints}/${MAX_COMPLAINTS})`,
        icon: 'report',
      });
    }

    return types;
  }, [canAmend, canAssign, canLicense, canSplit, canWithdraw, canComplain, remainingComplaints, t]);

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
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
                  <div className="py-1">
                    {requestTypes.length > 0 ? (
                      requestTypes.map(({ type, label, icon }) => (
                        <Link
                          key={type}
                          to={`/app/applications/${applicationId}/requests/${type}/new`}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={() => setShowCreateMenu(false)}
                        >
                          <span className="material-symbols-outlined mr-3 !text-lg">{icon}</span>
                          {label}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined mr-2 !text-lg align-middle">info</span>
                        {t('request.noAvailableTypes', 'No request types available for this status')}
                      </div>
                    )}
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
