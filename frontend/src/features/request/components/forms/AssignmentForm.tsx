import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { assignmentSchema, type AssignmentFormData } from '../../schemas/requestSchemas';
import { TransferTypeValues, TransferTypeLabels } from '../../types/enums';

interface AssignmentFormProps {
  defaultValues?: Partial<AssignmentFormData>;
  onSubmit: (data: AssignmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
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
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      assignor_user_id: defaultValues?.assignor_user_id || 0,
      assignee_user_id: defaultValues?.assignee_user_id || 0,
      transfer_type: defaultValues?.transfer_type || 'CONTRACT',
      contract_number: defaultValues?.contract_number || '',
      contract_date: defaultValues?.contract_date || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Transfer Type */}
      <div>
        <label
          htmlFor="transfer_type"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.assignment.transferType')} <span className="text-red-500">*</span>
        </label>
        <select
          id="transfer_type"
          {...register('transfer_type')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {TransferTypeValues.map((type) => (
            <option key={type} value={type}>
              {TransferTypeLabels[type]}
            </option>
          ))}
        </select>
        {errors.transfer_type && (
          <p className="mt-1 text-sm text-red-600">{errors.transfer_type.message}</p>
        )}
      </div>

      {/* Assignor User ID */}
      <div>
        <label
          htmlFor="assignor_user_id"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.assignment.assignor')} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="assignor_user_id"
          {...register('assignor_user_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.assignment.assignorPlaceholder')}
        />
        {errors.assignor_user_id && (
          <p className="mt-1 text-sm text-red-600">{errors.assignor_user_id.message}</p>
        )}
      </div>

      {/* Assignee User ID */}
      <div>
        <label
          htmlFor="assignee_user_id"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.assignment.assignee')} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="assignee_user_id"
          {...register('assignee_user_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.assignment.assigneePlaceholder')}
        />
        {errors.assignee_user_id && (
          <p className="mt-1 text-sm text-red-600">{errors.assignee_user_id.message}</p>
        )}
      </div>

      {/* Contract Number */}
      <div>
        <label
          htmlFor="contract_number"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.assignment.contractNumber')}
        </label>
        <input
          type="text"
          id="contract_number"
          {...register('contract_number')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.assignment.contractNumberPlaceholder')}
        />
        {errors.contract_number && (
          <p className="mt-1 text-sm text-red-600">{errors.contract_number.message}</p>
        )}
      </div>

      {/* Contract Date */}
      <div>
        <label
          htmlFor="contract_date"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.assignment.contractDate')}
        </label>
        <input
          type="date"
          id="contract_date"
          {...register('contract_date')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.contract_date && (
          <p className="mt-1 text-sm text-red-600">{errors.contract_date.message}</p>
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
          {t('common.create')}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
