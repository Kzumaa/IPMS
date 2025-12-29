import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { appealSchema, type AppealFormData } from '../../schemas/requestSchemas';

interface AppealFormProps {
  defaultValues?: Partial<AppealFormData>;
  onSubmit: (data: AppealFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AppealForm: React.FC<AppealFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppealFormData>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      target_decision_id: defaultValues?.target_decision_id,
      target_event_id: defaultValues?.target_event_id,
      notice_date: defaultValues?.notice_date || '',
      grounds: defaultValues?.grounds || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Decision ID */}
        <div>
          <label
            htmlFor="target_decision_id"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.appeal.targetDecision')}
          </label>
          <input
            type="number"
            id="target_decision_id"
            {...register('target_decision_id', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('request.appeal.targetDecisionPlaceholder')}
          />
          {errors.target_decision_id && (
            <p className="mt-1 text-sm text-red-600">{errors.target_decision_id.message}</p>
          )}
        </div>

        {/* Target Event ID */}
        <div>
          <label
            htmlFor="target_event_id"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.appeal.targetEvent')}
          </label>
          <input
            type="number"
            id="target_event_id"
            {...register('target_event_id', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('request.appeal.targetEventPlaceholder')}
          />
          {errors.target_event_id && (
            <p className="mt-1 text-sm text-red-600">{errors.target_event_id.message}</p>
          )}
        </div>
      </div>

      {/* Notice Date */}
      <div>
        <label
          htmlFor="notice_date"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.appeal.noticeDate')}
        </label>
        <input
          type="date"
          id="notice_date"
          {...register('notice_date')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.notice_date && (
          <p className="mt-1 text-sm text-red-600">{errors.notice_date.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('request.appeal.noticeDateHelp')}
        </p>
      </div>

      {/* Grounds */}
      <div>
        <label
          htmlFor="grounds"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.appeal.grounds')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="grounds"
          {...register('grounds')}
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.appeal.groundsPlaceholder')}
        />
        {errors.grounds && (
          <p className="mt-1 text-sm text-red-600">{errors.grounds.message}</p>
        )}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex">
          <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-3">
            warning
          </span>
          <div className="text-sm text-red-800 dark:text-red-200">
            <p className="font-medium mb-1">{t('request.appeal.deadlineWarning')}</p>
            <p>{t('request.appeal.deadlineWarningDesc')}</p>
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">refresh</span>
          )}
          {t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default AppealForm;
