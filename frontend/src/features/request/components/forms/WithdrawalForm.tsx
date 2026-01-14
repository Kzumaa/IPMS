import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { withdrawalSchema, type WithdrawalFormData } from '../../schemas/requestSchemas';

interface WithdrawalFormProps {
  defaultValues?: Partial<WithdrawalFormData>;
  onSubmit: (data: WithdrawalFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  applicationTitle?: string;
  filingNumber?: string;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  applicationTitle,
  filingNumber,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      reason: defaultValues?.reason || '',
      effective_date: defaultValues?.effective_date || new Date().toISOString().split('T')[0],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Warning Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
            <span className="material-symbols-outlined !text-2xl text-amber-600 dark:text-amber-400">
              undo
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {t('request.withdrawal.withdrawApplication', 'Withdraw Application')}
            </p>
            {filingNumber && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('request.withdrawal.filingNumber', 'Filing Number')}: {filingNumber}
              </p>
            )}
            {applicationTitle && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {applicationTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400 !text-lg mt-0.5">
            warning
          </span>
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-medium mb-1">{t('request.withdrawal.warningTitle', 'Important Notice')}</p>
            <p>{t('request.withdrawal.warningDesc', 'Withdrawing an application will cancel all pending examination processes. This action cannot be undone. Once withdrawn, you will need to file a new application if you wish to seek protection for the same invention.')}</p>
          </div>
        </div>
      </div>

      {/* Effective Date */}
      <div>
        <label
          htmlFor="effective_date"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.withdrawal.effectiveDate', 'Effective Date')}
        </label>
        <input
          type="date"
          id="effective_date"
          {...register('effective_date')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.effective_date && (
          <p className="mt-1 text-sm text-red-600">{errors.effective_date.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('request.withdrawal.effectiveDateHelp', 'The date when the withdrawal will take effect. Leave blank for immediate effect upon approval.')}
        </p>
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.withdrawal.reason', 'Reason for Withdrawal')}
        </label>
        <textarea
          id="reason"
          {...register('reason')}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.withdrawal.reasonPlaceholder', 'Optionally provide a reason for withdrawing this application...')}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 !text-lg mt-0.5">
            info
          </span>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium mb-1">{t('request.withdrawal.whatHappens', 'What happens after withdrawal?')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('request.withdrawal.effect1', 'The application status will change to WITHDRAWN')}</li>
              <li>{t('request.withdrawal.effect2', 'All pending examination processes will be cancelled')}</li>
              <li>{t('request.withdrawal.effect3', 'No protection rights will be granted')}</li>
              <li>{t('request.withdrawal.effect4', 'Any fees already paid will not be refunded')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium text-center">
          {t('request.withdrawal.confirmMessage', 'Are you sure you want to withdraw this application? This action cannot be undone.')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600
            rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">refresh</span>
          )}
          {t('request.withdrawal.submitWithdrawal', 'Submit Withdrawal Request')}
        </button>
      </div>
    </form>
  );
};

export default WithdrawalForm;
