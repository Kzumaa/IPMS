import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { terminationSchema, type TerminationFormData } from '../../schemas/requestSchemas';

interface TerminationFormProps {
  defaultValues?: Partial<TerminationFormData>;
  onSubmit: (data: TerminationFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  protectionTitleNumber?: string;
  grantDate?: string;
}

const TerminationForm: React.FC<TerminationFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  protectionTitleNumber,
  grantDate,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TerminationFormData>({
    resolver: zodResolver(terminationSchema),
    defaultValues: {
      reason: defaultValues?.reason || '',
    },
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Warning Banner */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
            <span className="material-symbols-outlined !text-2xl text-red-600 dark:text-red-400">
              cancel
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {t('request.termination.terminateTitle', 'Terminate Protection Title')}
            </p>
            {protectionTitleNumber && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('request.termination.titleNumber', 'Title Number')}: {protectionTitleNumber}
              </p>
            )}
          </div>
        </div>

        {/* Grant Date Info */}
        {grantDate && (
          <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 dark:text-red-400">
                {t('request.termination.grantDate', 'Grant Date')}:
              </span>
              <span className="text-red-800 dark:text-red-200 font-medium">
                {formatDate(grantDate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-lg mt-0.5">
            warning
          </span>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium mb-1">{t('request.termination.warningTitle', 'Important Notice')}</p>
            <p>{t('request.termination.warningDesc', 'Terminating a protection title is irreversible. Once terminated, you will lose all rights associated with this intellectual property. Please consider carefully before proceeding.')}</p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.termination.reason', 'Reason for Termination')}
        </label>
        <textarea
          id="reason"
          {...register('reason')}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.termination.reasonPlaceholder', 'Optionally provide a reason for terminating this protection title...')}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Fee Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 !text-lg mt-0.5">
            payments
          </span>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium mb-1">{t('request.termination.feeInfo', 'Termination Fee')}</p>
            <p>{t('request.termination.feeDescription', 'The termination fee is 50,000 VND per application.')}</p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-200 font-medium text-center">
          {t('request.termination.confirmMessage', 'Are you sure you want to terminate this protection title? This action cannot be undone.')}
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
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">refresh</span>
          )}
          {t('request.termination.submitTermination', 'Submit Termination Request')}
        </button>
      </div>
    </form>
  );
};

export default TerminationForm;
