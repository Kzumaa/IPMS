import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { renewalSchema, type RenewalFormData } from '../../schemas/requestSchemas';

interface RenewalFormProps {
  defaultValues?: Partial<RenewalFormData>;
  onSubmit: (data: RenewalFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  currentExpirationDate?: string;
  protectionTitleNumber?: string;
}

const RenewalForm: React.FC<RenewalFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  currentExpirationDate,
  protectionTitleNumber,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      renewal_years: defaultValues?.renewal_years || 1,
    },
  });

  const renewalYears = watch('renewal_years');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateNewExpiration = () => {
    if (!currentExpirationDate || !renewalYears) return null;
    const date = new Date(currentExpirationDate);
    date.setFullYear(date.getFullYear() + renewalYears);
    return date.toISOString().split('T')[0];
  };

  const newExpirationDate = calculateNewExpiration();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Status Banner */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <span className="material-symbols-outlined !text-2xl text-green-600 dark:text-green-400">
              autorenew
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {t('request.renewal.renewTitle', 'Renew Protection Title')}
            </p>
            {protectionTitleNumber && (
              <p className="text-xs text-green-600 dark:text-green-400">
                {t('request.renewal.titleNumber', 'Title Number')}: {protectionTitleNumber}
              </p>
            )}
          </div>
        </div>

        {/* Current Expiration Info */}
        {currentExpirationDate && (
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">
                {t('request.renewal.currentExpiration', 'Current Expiration')}:
              </span>
              <span className="text-green-800 dark:text-green-200 font-medium">
                {formatDate(currentExpirationDate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Renewal Years */}
      <div>
        <label
          htmlFor="renewal_years"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.renewal.renewalYears', 'Number of Years to Renew')} <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            id="renewal_years"
            {...register('renewal_years', { valueAsNumber: true })}
            min={1}
            max={20}
            className="w-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="text-slate-600 dark:text-slate-400">
            {t('request.renewal.years', 'year(s)')}
          </span>
        </div>
        {errors.renewal_years && (
          <p className="mt-1 text-sm text-red-600">{errors.renewal_years.message}</p>
        )}
      </div>

      {/* New Expiration Preview */}
      {newExpirationDate && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-600 dark:text-indigo-400">
              {t('request.renewal.newExpiration', 'New Expiration Date')}:
            </span>
            <span className="text-lg font-medium text-indigo-800 dark:text-indigo-200">
              {formatDate(newExpirationDate)}
            </span>
          </div>
        </div>
      )}

      {/* Fee Info */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-lg mt-0.5">
            payments
          </span>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium mb-1">{t('request.renewal.feeInfo', 'Renewal Fee')}</p>
            <p>{t('request.renewal.feeDescription', 'The renewal fee is 100,000 VND per option/class per year. The exact fee will be calculated after submission.')}</p>
          </div>
        </div>
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">refresh</span>
          )}
          {t('request.renewal.submitRenewal', 'Submit Renewal Request')}
        </button>
      </div>
    </form>
  );
};

export default RenewalForm;
