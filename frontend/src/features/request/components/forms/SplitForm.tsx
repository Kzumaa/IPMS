import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { splitSchema, type SplitFormData } from '../../schemas/requestSchemas';

interface SplitFormProps {
  defaultValues?: Partial<SplitFormData>;
  onSubmit: (data: SplitFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SplitForm: React.FC<SplitFormProps> = ({
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
  } = useForm<SplitFormData>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      split_description: defaultValues?.split_description || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Split Description */}
      <div>
        <label
          htmlFor="split_description"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.split.description')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="split_description"
          {...register('split_description')}
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.split.descriptionPlaceholder')}
        />
        {errors.split_description && (
          <p className="mt-1 text-sm text-red-600">{errors.split_description.message}</p>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mr-3">
            info
          </span>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">{t('request.split.infoTitle')}</p>
            <p>{t('request.split.infoDescription')}</p>
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

export default SplitForm;
