import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createComplaint, submitComplaint, fetchAllRequests } from '../../features/request/store/requestSlice';
import { fetchApplication } from '../../features/application/store/applicationSlice';
import { ComplaintForm } from '../../features/request/components/forms';
import type { ComplaintFormData } from '../../features/request/schemas/requestSchemas';
import { ApplicationStatus } from '../../features/application/types/enums';

const MAX_COMPLAINTS = 3;

const CreateComplaintPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, requests } = useAppSelector((state) => state.request);
  const { currentApplication } = useAppSelector((state) => state.application);
  const applicationId = parseInt(id || '0', 10);

  useEffect(() => {
    if (applicationId) {
      dispatch(fetchApplication(applicationId));
      dispatch(fetchAllRequests(applicationId));
    }
  }, [applicationId, dispatch]);

  // Calculate complaint count
  const complaintCount = useMemo(() => {
    return requests.filter((r) => r.type === 'COMPLAINT').length;
  }, [requests]);

  const remainingComplaints = MAX_COMPLAINTS - complaintCount;
  const complaintNumber = complaintCount + 1;

  // Validate application status for complaint
  const complaintableStatuses: string[] = [
    ApplicationStatus.DECLINED,
    ApplicationStatus.COMPLAINING,
    ApplicationStatus.CHECKING_COMPLAINT,
  ];
  const canComplain = remainingComplaints > 0 && currentApplication && complaintableStatuses.includes(currentApplication.status);

  const handleSubmit = async (data: ComplaintFormData) => {
    // Create the complaint
    const createResult = await dispatch(createComplaint({ applicationId, data }));
    if (createComplaint.fulfilled.match(createResult)) {
      // Immediately submit it
      const requestId = createResult.payload.id;
      const submitResult = await dispatch(submitComplaint({ applicationId, requestId }));
      if (submitComplaint.fulfilled.match(submitResult)) {
        navigate(`/app/applications/${applicationId}`);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/app/applications/${applicationId}`);
  };

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
            {t('request.createComplaint')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!canComplain && currentApplication && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-xl">
                warning
              </span>
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {remainingComplaints <= 0
                    ? t('request.complaint.maxReached', 'Maximum Complaints Reached')
                    : t('request.complaint.notComplainable', 'Complaint Not Available')
                  }
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {remainingComplaints <= 0
                    ? t('request.complaint.maxReachedDesc', 'You have filed the maximum number of complaints ({{max}}) allowed for this decision.', { max: MAX_COMPLAINTS })
                    : t('request.complaint.notComplainableDesc', 'Complaints can only be filed for applications that have been declined. Current status: {{status}}', {
                        status: t(`application.statuses.${currentApplication.status}`),
                      })
                  }
                </p>
                <Link
                  to={`/app/applications/${applicationId}`}
                  className="inline-flex items-center mt-3 text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100"
                >
                  <span className="material-symbols-outlined mr-1 !text-base">arrow_back</span>
                  {t('common.backToApplication', 'Back to Application')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {canComplain && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
            <ComplaintForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              complaintNumber={complaintNumber}
              remainingComplaints={remainingComplaints}
              maxComplaints={MAX_COMPLAINTS}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateComplaintPage;
