import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTermination } from '../../features/request/store/requestSlice';
import { fetchApplication } from '../../features/application/store/applicationSlice';
import { TerminationForm } from '../../features/request/components/forms';
import type { TerminationFormData } from '../../features/request/schemas/requestSchemas';
import type { CreateTerminationDTO } from '../../features/request/types/requestTypes';
import { ApplicationStatus } from '../../features/application/types/enums';

const CreateTerminationPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.request);
  const { currentApplication } = useAppSelector((state) => state.application);
  const applicationId = parseInt(id || '0', 10);

  useEffect(() => {
    if (applicationId) {
      dispatch(fetchApplication(applicationId));
    }
  }, [applicationId, dispatch]);

  // Validate application status - only GRANTED applications can be terminated
  const canCreateTermination = currentApplication?.status === ApplicationStatus.GRANTED;

  const handleSubmit = async (data: TerminationFormData) => {
    const result = await dispatch(createTermination({ applicationId, data: data as CreateTerminationDTO }));
    if (createTermination.fulfilled.match(result)) {
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
            {t('request.createTermination')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!canCreateTermination && currentApplication && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-xl">
                warning
              </span>
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('request.termination.notGranted', 'Termination Not Available')}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {t('request.termination.notGrantedDesc', 'Termination requests can only be created for applications that have been granted. Current status: {{status}}', {
                    status: t(`application.statuses.${currentApplication.status}`),
                  })}
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

        {canCreateTermination && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
            <TerminationForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              grantDate={currentApplication?.issue_date || undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateTerminationPage;
