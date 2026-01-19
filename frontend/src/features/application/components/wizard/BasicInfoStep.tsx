import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormCheckbox } from '../forms';
import { AppType } from '../../types/enums';
import type { BasicInfoFormData } from '../../schemas/applicationSchemas';
import type { PriorityKind } from '../../types/applicationTypes';

const BasicInfoStep: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useFormContext<BasicInfoFormData>();

    const isPct = watch('is_pct');
    const appType = watch('app_type');
    const isStateBudgetTask = watch('is_state_budget_task');
    const hasPriorityClaim = watch('has_priority_claim');
    const priorityType = watch('priority_type');

    // Priority claims field array
    const { fields: priorityClaims, append: appendPriorityClaim, remove: removePriorityClaim } = useFieldArray({
        control,
        name: 'priority_claims',
    });

    const isIndustrialDesign = appType === AppType.INDUSTRIAL_DESIGN;
    const isPatentOrUtility = appType === AppType.PATENT || appType === AppType.UTILITY;

    // Get app type options - only show PATENT and INDUSTRIAL_DESIGN (UTILITY merged with PATENT)
    const appTypeOptions = [
        { value: AppType.PATENT, label: t('application.appTypes.PATENT') },
        { value: AppType.INDUSTRIAL_DESIGN, label: t('application.appTypes.INDUSTRIAL_DESIGN') },
    ];

    // Priority type options
    const priorityTypeOptions: { value: PriorityKind; label: string }[] = [
        { value: 'VN_FIRST', label: t('application.steps.priority.types.vnFirst') },
        { value: 'PARIS', label: t('application.steps.priority.types.paris') },
        { value: 'OTHER', label: t('application.steps.priority.types.other') },
    ];

    const handleAddPriorityClaim = () => {
        appendPriorityClaim({
            kind: priorityType || null,
            number: '',
            filing_date: '',
            country_code: '',
            agreement_name: null,
        });
    };

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.basicInfo.sectionTitle')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormSelect
                            label={t('application.steps.basicInfo.appType')}
                            name="app_type"
                            options={appTypeOptions}
                            placeholder={t('application.steps.basicInfo.appTypePlaceholder')}
                            required
                            register={register('app_type')}
                            error={errors.app_type}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormInput
                            label={isIndustrialDesign
                                ? t('application.steps.basicInfo.designTitle')
                                : t('application.steps.basicInfo.inventionTitle')}
                            name="title"
                            placeholder={isIndustrialDesign
                                ? t('application.steps.basicInfo.designTitlePlaceholder')
                                : t('application.steps.basicInfo.inventionTitlePlaceholder')}
                            required
                            register={register('title')}
                            error={errors.title}
                        />
                    </div>

                    {/* Note about file uploads */}
                    <div className="md:col-span-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mr-2 mt-0.5">info</span>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        {t('application.steps.basicInfo.documentsNote')}
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {t('application.steps.basicInfo.documentsNoteDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Design Specific: State Budget Task */}
            {isIndustrialDesign && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t('application.steps.stateBudget.title')}
                    </h3>

                    <FormCheckbox
                        label={t('application.steps.stateBudget.isStateBudget')}
                        name="is_state_budget_task"
                        register={register('is_state_budget_task')}
                        error={errors.is_state_budget_task}
                    />

                    {isStateBudgetTask && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <FormInput
                                label={t('application.steps.stateBudget.agencyName')}
                                name="managing_agency_name"
                                placeholder={t('application.steps.stateBudget.agencyNamePlaceholder')}
                                required
                                register={register('managing_agency_name')}
                                error={errors.managing_agency_name}
                            />

                            <FormInput
                                label={t('application.steps.stateBudget.taskName')}
                                name="task_name"
                                placeholder={t('application.steps.stateBudget.taskNamePlaceholder')}
                                required
                                register={register('task_name')}
                                error={errors.task_name}
                            />

                            <FormInput
                                label={t('application.steps.stateBudget.taskCode')}
                                name="task_code"
                                placeholder={t('application.steps.stateBudget.taskCodePlaceholder')}
                                required
                                register={register('task_code')}
                                error={errors.task_code}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Industrial Design Specific: Locarno Classification & Field of Use */}
            {isIndustrialDesign && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t('application.steps.classification.titleLocarno')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label={t('application.steps.classification.locarno')}
                            name="locarno_classification"
                            placeholder={t('application.steps.classification.locarnoPlaceholder')}
                            register={register('locarno_classification')}
                            error={errors.locarno_classification}
                            helperText={t('application.steps.classification.locarnoHelper')}
                        />

                        <FormInput
                            label={t('application.steps.classification.fieldOfUse')}
                            name="field_of_use"
                            placeholder={t('application.steps.classification.fieldOfUsePlaceholder')}
                            register={register('field_of_use')}
                            error={errors.field_of_use}
                        />
                    </div>
                </div>
            )}

            {/* Patent/Utility Specific: IPC Classification */}
            {isPatentOrUtility && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t('application.steps.classification.titleIpc')}
                    </h3>

                    <FormInput
                        label={t('application.steps.classification.ipc')}
                        name="ipc_classification"
                        placeholder={t('application.steps.classification.ipcPlaceholder')}
                        register={register('ipc_classification')}
                        error={errors.ipc_classification}
                        helperText={t('application.steps.classification.ipcHelper')}
                    />
                </div>
            )}

            {/* PCT Information - Only for Patent/Utility */}
            {isPatentOrUtility && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t('application.steps.pct.title')}
                    </h3>

                    <FormCheckbox
                        label={t('application.steps.pct.isPct')}
                        name="is_pct"
                        register={register('is_pct')}
                        error={errors.is_pct}
                    />

                    {isPct && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <FormInput
                                label={t('application.steps.pct.pctNumber')}
                                name="pct_number"
                                placeholder={t('application.steps.pct.pctNumberPlaceholder')}
                                required
                                register={register('pct_number')}
                                error={errors.pct_number}
                            />

                            <FormInput
                                label={t('application.steps.pct.pctFilingDate')}
                                name="pct_filing_date"
                                type="date"
                                required
                                register={register('pct_filing_date')}
                                error={errors.pct_filing_date}
                            />

                            <FormInput
                                label={t('application.steps.pct.pctPublicationDate')}
                                name="pct_publication_date"
                                type="date"
                                register={register('pct_publication_date')}
                                error={errors.pct_publication_date}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Priority Claims */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.priority.title')}
                </h3>

                <FormCheckbox
                    label={t('application.steps.priority.hasPriority')}
                    name="has_priority_claim"
                    register={register('has_priority_claim')}
                    error={errors.has_priority_claim}
                />

                {hasPriorityClaim && (
                    <div className="mt-4 space-y-4">
                        {/* Priority Type Selection */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                {t('application.steps.priority.typeLabel')}
                            </label>
                            <div className="space-y-2">
                                {priorityTypeOptions.map((option) => (
                                    <label key={option.value} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            value={option.value}
                                            checked={priorityType === option.value}
                                            onChange={() => setValue('priority_type', option.value)}
                                            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Priority Claims Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                            {t('application.steps.priority.number')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                            {t('application.steps.priority.date')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                            {t('application.steps.priority.country')}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {priorityClaims.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    {...register(`priority_claims.${index}.number`)}
                                                    placeholder={t('application.steps.priority.numberPlaceholder')}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    {...register(`priority_claims.${index}.filing_date`)}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    {...register(`priority_claims.${index}.country_code`)}
                                                    placeholder={t('application.steps.priority.countryPlaceholder')}
                                                    maxLength={2}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white uppercase"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removePriorityClaim(index)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {priorityClaims.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                {t('application.steps.priority.noClaims')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddPriorityClaim}
                            className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            <span className="material-symbols-outlined mr-1 text-lg">add</span>
                            {t('application.steps.priority.addClaim')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicInfoStep;
