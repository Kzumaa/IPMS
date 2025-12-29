import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { licenseSchema, type LicenseFormData } from '../../schemas/requestSchemas';
import { LicenseTypeValues, LicenseTypeLabels } from '../../types/enums';

interface LicenseFormProps {
  defaultValues?: Partial<LicenseFormData>;
  onSubmit: (data: LicenseFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const LicenseForm: React.FC<LicenseFormProps> = ({
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
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licensor_user_id: defaultValues?.licensor_user_id || 0,
      licensee_user_id: defaultValues?.licensee_user_id || 0,
      license_type: defaultValues?.license_type || 'NON_EXCLUSIVE',
      valid_from: defaultValues?.valid_from || '',
      valid_to: defaultValues?.valid_to || '',
      scope_territory: defaultValues?.scope_territory || '',
      scope_products: defaultValues?.scope_products || '',
      contract_number: defaultValues?.contract_number || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* License Type */}
      <div>
        <label
          htmlFor="license_type"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.license.licenseType')} <span className="text-red-500">*</span>
        </label>
        <select
          id="license_type"
          {...register('license_type')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {LicenseTypeValues.map((type) => (
            <option key={type} value={type}>
              {LicenseTypeLabels[type]}
            </option>
          ))}
        </select>
        {errors.license_type && (
          <p className="mt-1 text-sm text-red-600">{errors.license_type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Licensor User ID */}
        <div>
          <label
            htmlFor="licensor_user_id"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.license.licensor')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="licensor_user_id"
            {...register('licensor_user_id', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('request.license.licensorPlaceholder')}
          />
          {errors.licensor_user_id && (
            <p className="mt-1 text-sm text-red-600">{errors.licensor_user_id.message}</p>
          )}
        </div>

        {/* Licensee User ID */}
        <div>
          <label
            htmlFor="licensee_user_id"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.license.licensee')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="licensee_user_id"
            {...register('licensee_user_id', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('request.license.licenseePlaceholder')}
          />
          {errors.licensee_user_id && (
            <p className="mt-1 text-sm text-red-600">{errors.licensee_user_id.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valid From */}
        <div>
          <label
            htmlFor="valid_from"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.license.validFrom')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="valid_from"
            {...register('valid_from')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.valid_from && (
            <p className="mt-1 text-sm text-red-600">{errors.valid_from.message}</p>
          )}
        </div>

        {/* Valid To */}
        <div>
          <label
            htmlFor="valid_to"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t('request.license.validTo')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="valid_to"
            {...register('valid_to')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.valid_to && (
            <p className="mt-1 text-sm text-red-600">{errors.valid_to.message}</p>
          )}
        </div>
      </div>

      {/* Scope Territory */}
      <div>
        <label
          htmlFor="scope_territory"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.license.scopeTerritory')}
        </label>
        <input
          type="text"
          id="scope_territory"
          {...register('scope_territory')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.license.scopeTerritoryPlaceholder')}
        />
        {errors.scope_territory && (
          <p className="mt-1 text-sm text-red-600">{errors.scope_territory.message}</p>
        )}
      </div>

      {/* Scope Products */}
      <div>
        <label
          htmlFor="scope_products"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.license.scopeProducts')}
        </label>
        <textarea
          id="scope_products"
          {...register('scope_products')}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.license.scopeProductsPlaceholder')}
        />
        {errors.scope_products && (
          <p className="mt-1 text-sm text-red-600">{errors.scope_products.message}</p>
        )}
      </div>

      {/* Contract Number */}
      <div>
        <label
          htmlFor="contract_number"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.license.contractNumber')}
        </label>
        <input
          type="text"
          id="contract_number"
          {...register('contract_number')}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.license.contractNumberPlaceholder')}
        />
        {errors.contract_number && (
          <p className="mt-1 text-sm text-red-600">{errors.contract_number.message}</p>
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

export default LicenseForm;
