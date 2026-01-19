import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createWithdrawal } from '../../features/request/store/requestSlice';
import { fetchApplication } from '../../features/application/store/applicationSlice';
import { WithdrawalForm } from '../../features/request/components/forms';
import type { WithdrawalFormData } from '../../features/request/schemas/requestSchemas';
import type { CreateWithdrawalDTO } from '../../features/request/types/requestTypes';
import { ApplicationStatus } from '../../features/application/types/enums';
import requestService from '../../features/request/services/requestService';

// Pre-grant statuses that allow withdrawal
const PRE_GRANT_STATUSES: string[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.FORMALITY_CHECKING,
  ApplicationStatus.FORMALITY_PASSED,
  ApplicationStatus.PUBLISHED,
  ApplicationStatus.SUBSTANTIVE_CHECKING,
];

const CreateWithdrawalPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.request);
  const { currentApplication } = useAppSelector((state) => state.application);
  const applicationId = parseInt(id || '0', 10);
  const [canWithdraw, setCanWithdraw] = useState<boolean | null>(null);
  const [checkingWithdraw, setCheckingWithdraw] = useState(true);

  useEffect(() => {
    if (applicationId) {
      dispatch(fetchApplication(applicationId));
      // Check if withdrawal is allowed via API
      requestService.canWithdraw(applicationId)
        .then((res) => setCanWithdraw(res.can_withdraw))
        .catch(() => setCanWithdraw(false))
        .finally(() => setCheckingWithdraw(false));
    }
  }, [applicationId, dispatch]);

  // Validate application status - only pre-grant applications can be withdrawn
  const isPreGrant = currentApplication && PRE_GRANT_STATUSES.includes(currentApplication.status);
  const canCreateWithdrawal = isPreGrant && canWithdraw === true;

  const handleSubmit = async (data: WithdrawalFormData) => {
    const result = await dispatch(createWithdrawal({ applicationId, data: data as CreateWithdrawalDTO }));
    if (createWithdrawal.fulfilled.match(result)) {
      navigate(`/app/applications/${applicationId}`);
    }
  };

  const handleCancel = () => {
    navigate(`/app/applications/${applicationId}`);
  };

  if (checkingWithdraw) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-indigo-600 !text-4xl">refresh</span>
          </div>
        </main>
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
            {t('request.createWithdrawal', 'Withdraw Application')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!canCreateWithdrawal && currentApplication && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-xl">
                warning
              </span>
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('request.withdrawal.notAvailable', 'Withdrawal Not Available')}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {currentApplication.status === ApplicationStatus.GRANTED
                    ? t('request.withdrawal.alreadyGranted', 'This application has already been granted. Use "Termination" to end your protection title.')
                    : currentApplication.status === ApplicationStatus.DRAFT
                    ? t('request.withdrawal.stillDraft', 'This application is still in draft. You can delete it directly instead of withdrawing.')
                    : t('request.withdrawal.notAllowed', 'Withdrawal is not available for applications with status: {{status}}', {
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

        {canCreateWithdrawal && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
            <WithdrawalForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
              applicationTitle={currentApplication?.title}
              filingNumber={currentApplication?.filing_number}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateWithdrawalPage;
