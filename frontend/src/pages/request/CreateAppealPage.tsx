import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppeal, fetchAllRequests } from '../../features/request/store/requestSlice';
import { fetchApplication } from '../../features/application/store/applicationSlice';
import { AppealForm } from '../../features/request/components/forms';
import type { AppealFormData } from '../../features/request/schemas/requestSchemas';
import { ApplicationStatus } from '../../features/application/types/enums';

const MAX_APPEALS = 3;

const CreateAppealPage: React.FC = () => {
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

  // Calculate appeal count
  const appealCount = useMemo(() => {
    return requests.filter((r) => r.type === 'APPEAL').length;
  }, [requests]);

  const remainingAppeals = MAX_APPEALS - appealCount;
  const appealNumber = appealCount + 1;

  // Validate application status for appeal
  const appealableStatuses: string[] = [
    ApplicationStatus.REFUSED,
    ApplicationStatus.APPEAL_PENDING,
    ApplicationStatus.APPEAL_EXAMINING,
  ];
  const canAppeal = remainingAppeals > 0 && currentApplication && appealableStatuses.includes(currentApplication.status);

  const handleSubmit = async (data: AppealFormData) => {
    const result = await dispatch(createAppeal({ applicationId, data }));
    if (createAppeal.fulfilled.match(result)) {
      navigate(`/app/applications/${applicationId}`);
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
            {t('request.createAppeal')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!canAppeal && currentApplication && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-xl">
                warning
              </span>
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {remainingAppeals <= 0
                    ? t('request.appeal.maxReached', 'Maximum Appeals Reached')
                    : t('request.appeal.notAppealable', 'Appeal Not Available')
                  }
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {remainingAppeals <= 0
                    ? t('request.appeal.maxReachedDesc', 'You have filed the maximum number of appeals ({{max}}) allowed for this decision.', { max: MAX_APPEALS })
                    : t('request.appeal.notAppealableDesc', 'Appeals can only be filed for applications that have been refused. Current status: {{status}}', {
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

        {canAppeal && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
            <AppealForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              appealNumber={appealNumber}
              remainingAppeals={remainingAppeals}
              maxAppeals={MAX_APPEALS}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateAppealPage;
