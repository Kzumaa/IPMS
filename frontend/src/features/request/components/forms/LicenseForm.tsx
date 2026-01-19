import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import {
  licenseSchema,
  type LicenseFormData,
} from "../../schemas/requestSchemas";
import { LicenseTypeValues, LicenseTypeLabels } from "../../types/enums";
import LicenseeSearch from "../LicenseeSearch";
import type { UserSearchResult } from "@/features/application/types/applicationTypes";

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
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id ?? 0;
  const [selectedLicensees, setSelectedLicensees] = useState<
    UserSearchResult[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licensor_user_id: defaultValues?.licensor_user_id || currentUserId,
      licensee_user_ids: defaultValues?.licensee_user_ids || [],
      license_type: defaultValues?.license_type || "NON_EXCLUSIVE",
      valid_from: defaultValues?.valid_from || "",
      valid_to: defaultValues?.valid_to || "",
      scope_territory: defaultValues?.scope_territory || "",
      scope_products: defaultValues?.scope_products || "",
      contract_number: defaultValues?.contract_number || "",
    },
  });

  // Guard: user must be logged in
  if (!user) {
    return null;
  }

  const handleLicenseeAdd = (user: UserSearchResult) => {
    // Check if already added
    if (selectedLicensees.some((l) => l.id === user.id)) {
      return;
    }

    const updatedLicensees = [...selectedLicensees, user];
    setSelectedLicensees(updatedLicensees);
    setValue(
      "licensee_user_ids",
      updatedLicensees.map((l) => l.id)
    );
  };

  const handleLicenseeRemove = (userId: number) => {
    const updatedLicensees = selectedLicensees.filter((l) => l.id !== userId);
    setSelectedLicensees(updatedLicensees);
    setValue(
      "licensee_user_ids",
      updatedLicensees.map((l) => l.id)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* License Type */}
      <div>
        <label
          htmlFor="license_type"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t("request.license.licenseType")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          id="license_type"
          {...register("license_type")}
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
          <p className="mt-1 text-sm text-red-600">
            {errors.license_type.message}
          </p>
        )}
      </div>

      {/* Info about license parties */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 !text-lg mt-0.5">
            info
          </span>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t(
              "request.license.partiesInfo",
              "The licensor (you) will grant the licensees the right to use this IP. Licensees must be registered users in the system. You can add multiple licensees."
            )}
          </p>
        </div>
      </div>

      {/* Licensor - hidden field, auto-filled with current user */}
      <input
        type="hidden"
        {...register("licensor_user_id", { valueAsNumber: true })}
      />

      {/* Selected Licensees List */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t("request.license.licensees", "Licensees")}{" "}
          <span className="text-red-500">*</span>
          {selectedLicensees.length > 0 && (
            <span className="text-slate-500 font-normal ml-2">
              ({selectedLicensees.length}/10)
            </span>
          )}
        </label>

        {selectedLicensees.length > 0 && (
          <div className="space-y-2 mb-3">
            {selectedLicensees.map((licensee) => (
              <div
                key={licensee.id}
                className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 !text-xl">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {licensee.full_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {licensee.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLicenseeRemove(licensee.id)}
                  disabled={loading}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined !text-lg">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Licensee Search */}
        {selectedLicensees.length < 10 && (
          <LicenseeSearch
            onAdd={handleLicenseeAdd}
            disabled={loading}
            error={errors.licensee_user_ids?.message}
            excludedUserIds={[
              currentUserId,
              ...selectedLicensees.map((l) => l.id),
            ]}
            placeholder={t(
              "request.license.searchLicensee",
              "Search for licensee by email..."
            )}
          />
        )}

        {selectedLicensees.length >= 10 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t(
              "request.license.maxLicensees",
              "Maximum number of licensees (10) reached"
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valid From */}
        <div>
          <label
            htmlFor="valid_from"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t("request.license.validFrom")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="valid_from"
            {...register("valid_from")}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.valid_from && (
            <p className="mt-1 text-sm text-red-600">
              {errors.valid_from.message}
            </p>
          )}
        </div>

        {/* Valid To */}
        <div>
          <label
            htmlFor="valid_to"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {t("request.license.validTo")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="valid_to"
            {...register("valid_to")}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
              bg-white dark:bg-slate-700 text-slate-900 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.valid_to && (
            <p className="mt-1 text-sm text-red-600">
              {errors.valid_to.message}
            </p>
          )}
        </div>
      </div>

      {/* Scope Territory */}
      <div>
        <label
          htmlFor="scope_territory"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t("request.license.scopeTerritory")}
        </label>
        <input
          type="text"
          id="scope_territory"
          {...register("scope_territory")}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t("request.license.scopeTerritoryPlaceholder")}
        />
        {errors.scope_territory && (
          <p className="mt-1 text-sm text-red-600">
            {errors.scope_territory.message}
          </p>
        )}
      </div>

      {/* Scope Products */}
      <div>
        <label
          htmlFor="scope_products"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t("request.license.scopeProducts")}
        </label>
        <textarea
          id="scope_products"
          {...register("scope_products")}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t("request.license.scopeProductsPlaceholder")}
        />
        {errors.scope_products && (
          <p className="mt-1 text-sm text-red-600">
            {errors.scope_products.message}
          </p>
        )}
      </div>

      {/* Contract Number */}
      <div>
        <label
          htmlFor="contract_number"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t("request.license.contractNumber")}
        </label>
        <input
          type="text"
          id="contract_number"
          {...register("contract_number")}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t("request.license.contractNumberPlaceholder")}
        />
        {errors.contract_number && (
          <p className="mt-1 text-sm text-red-600">
            {errors.contract_number.message}
          </p>
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
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">
              refresh
            </span>
          )}
          {t("common.create")}
        </button>
      </div>
    </form>
  );
};

export default LicenseForm;
