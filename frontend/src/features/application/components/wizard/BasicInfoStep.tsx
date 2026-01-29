import React, { useState, useEffect } from 'react';
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
    
    const ipcValue = watch('ipc_classification');
    const locarnoValue = watch('locarno_classification');

    // Local state for split inputs
    const [ipcParts, setIpcParts] = useState({ section: '', classCode: '', subclass: '', group: '' });
    const [locarnoParts, setLocarnoParts] = useState({ classCode: '', subclass: '', product: '' });

    // Parse IPC value on load / change
    useEffect(() => {
        if (!ipcValue) return;
        // Expected format: A01B 1/00 (Section Class Subclass Group)
        // Heuristic parsing
        const match = ipcValue.match(/^([A-Z])(\d{0,2})([A-Z]?)\s*(.*)$/);
        if (match) {
            setIpcParts({
                section: match[1] || '',
                classCode: match[2] || '',
                subclass: match[3] || '',
                group: match[4] || ''
            });
        }
    }, [ipcValue]);

    // Parse Locarno value on load / change
    useEffect(() => {
        if (!locarnoValue) return;
        // Expected format: 01-01-100001 (Class-Subclass-Product)
        const parts = locarnoValue.split('-');
        setLocarnoParts({
            classCode: parts[0] || '',
            subclass: parts[1] || '',
            product: parts.slice(2).join('-') || ''
        });
    }, [locarnoValue]);

    const updateIpc = (newParts: typeof ipcParts) => {
        setIpcParts(newParts);
        // Construct: Section(1) + Class(2) + Subclass(1) + space + Group
        const val = `${newParts.section}${newParts.classCode}${newParts.subclass} ${newParts.group}`.trim();
        setValue('ipc_classification', val, { shouldValidate: true });
    };

    const updateLocarno = (newParts: typeof locarnoParts) => {
        setLocarnoParts(newParts);
        // Construct: Class-Subclass-Product
        // Only add hyphens if previous part exists to avoid leading hyphens on partial entry?
        // User asked for "01 - 01 - 100001".
        const val = [newParts.classCode, newParts.subclass, newParts.product]
            .filter(p => p) // simple join?
            .join('-');
        setValue('locarno_classification', val, { shouldValidate: true });
    };

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

    const inputBaseClass = "w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-slate-300 dark:border-slate-600";

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
                        {/* Locarno Split Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t('application.steps.classification.locarno')}
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    className={`${inputBaseClass} w-16 text-center`}
                                    placeholder="01"
                                    value={locarnoParts.classCode}
                                    onChange={(e) => updateLocarno({ ...locarnoParts, classCode: e.target.value })}
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="text"
                                    className={`${inputBaseClass} w-16 text-center`}
                                    placeholder="01"
                                    value={locarnoParts.subclass}
                                    onChange={(e) => updateLocarno({ ...locarnoParts, subclass: e.target.value })}
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="text"
                                    className={`${inputBaseClass} flex-1`}
                                    placeholder="100001"
                                    value={locarnoParts.product}
                                    onChange={(e) => updateLocarno({ ...locarnoParts, product: e.target.value })}
                                />
                            </div>
                            {errors.locarno_classification && (
                                <p className="mt-1 text-sm text-red-500">{errors.locarno_classification.message}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('application.steps.classification.locarnoHelper')}
                            </p>
                        </div>

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

                    {/* IPC Split Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.steps.classification.ipc')}
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                className={`${inputBaseClass} w-14 text-center`}
                                placeholder="A"
                                maxLength={1}
                                value={ipcParts.section}
                                onChange={(e) => updateIpc({ ...ipcParts, section: e.target.value.toUpperCase() })}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="text"
                                className={`${inputBaseClass} w-16 text-center`}
                                placeholder="01"
                                maxLength={2}
                                value={ipcParts.classCode}
                                onChange={(e) => updateIpc({ ...ipcParts, classCode: e.target.value })}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="text"
                                className={`${inputBaseClass} w-14 text-center`}
                                placeholder="B"
                                maxLength={1}
                                value={ipcParts.subclass}
                                onChange={(e) => updateIpc({ ...ipcParts, subclass: e.target.value.toUpperCase() })}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="text"
                                className={`${inputBaseClass} flex-1`}
                                placeholder="1/00"
                                value={ipcParts.group}
                                onChange={(e) => updateIpc({ ...ipcParts, group: e.target.value })}
                            />
                        </div>
                        {errors.ipc_classification && (
                            <p className="mt-1 text-sm text-red-500">{errors.ipc_classification.message}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {t('application.steps.classification.ipcHelper')}
                        </p>
                    </div>
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
