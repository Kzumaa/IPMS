import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { amendmentSchema, type AmendmentFormData } from '../../schemas/requestSchemas';
import { AmendmentSectionValues, AmendmentSectionLabels } from '../../types/enums';

interface AmendmentFormProps {
  defaultValues?: Partial<AmendmentFormData>;
  onSubmit: (data: AmendmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const AmendmentForm: React.FC<AmendmentFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmendmentFormData>({
    resolver: zodResolver(amendmentSchema),
    defaultValues: {
      section: defaultValues?.section || 'BIBLIOGRAPHY',
      change_summary: defaultValues?.change_summary || '',
      field_name: defaultValues?.field_name || '',
      old_value: defaultValues?.old_value || '',
      new_value: defaultValues?.new_value || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section */}
      <div>
        <label
          htmlFor="section"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.amendment.section')} <span className="text-red-500">*</span>
        </label>
        <select
          id="section"
          {...register('section')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {AmendmentSectionValues.map((section) => (
            <option key={section} value={section}>
              {AmendmentSectionLabels[section]}
            </option>
          ))}
        </select>
        {errors.section && (
          <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
        )}
      </div>

      {/* Change Summary */}
      <div>
        <label
          htmlFor="change_summary"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.amendment.changeSummary')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="change_summary"
          {...register('change_summary')}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.amendment.changeSummaryPlaceholder')}
        />
        {errors.change_summary && (
          <p className="mt-1 text-sm text-red-600">{errors.change_summary.message}</p>
        )}
      </div>

      {/* Field Name (optional) */}
      <div>
        <label
          htmlFor="field_name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.amendment.fieldName')}
        </label>
        <input
          type="text"
          id="field_name"
          {...register('field_name')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.amendment.fieldNamePlaceholder')}
        />
        {errors.field_name && (
          <p className="mt-1 text-sm text-red-600">{errors.field_name.message}</p>
        )}
      </div>

      {/* Old Value */}
      <div>
        <label
          htmlFor="old_value"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.amendment.oldValue')}
        </label>
        <textarea
          id="old_value"
          {...register('old_value')}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.amendment.oldValuePlaceholder')}
        />
        {errors.old_value && (
          <p className="mt-1 text-sm text-red-600">{errors.old_value.message}</p>
        )}
      </div>

      {/* New Value */}
      <div>
        <label
          htmlFor="new_value"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.amendment.newValue')}
        </label>
        <textarea
          id="new_value"
          {...register('new_value')}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.amendment.newValuePlaceholder')}
        />
        {errors.new_value && (
          <p className="mt-1 text-sm text-red-600">{errors.new_value.message}</p>
        )}
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
          {isEdit ? t('common.update') : t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default AmendmentForm;
