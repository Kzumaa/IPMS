import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormInput, FormSelect, FormCheckbox } from '../forms';
import { AppType } from '../../types/enums';
import type { BasicInfoFormData } from '../../schemas/applicationSchemas';

const BasicInfoStep: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<BasicInfoFormData>();

    const isPct = watch('is_pct');

    // Get app type options from translations
    const appTypeOptions = Object.keys(AppType).map((key) => ({
        value: key,
        label: t(`application.appTypes.${key}`),
    }));

    return (
        <div className="space-y-6">
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
                            label={t('application.steps.basicInfo.inventionTitle')}
                            name="title"
                            placeholder={t('application.steps.basicInfo.inventionTitlePlaceholder')}
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

            {/* PCT Information */}
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

            {/* Priority Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.priority.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {t('application.steps.priority.description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label={t('application.steps.priority.number')}
                        name="priority_number"
                        placeholder={t('application.steps.priority.numberPlaceholder')}
                        register={register('priority_number')}
                        error={errors.priority_number}
                    />

                    <FormInput
                        label={t('application.steps.priority.date')}
                        name="priority_date"
                        type="date"
                        register={register('priority_date')}
                        error={errors.priority_date}
                    />

                    <FormInput
                        label={t('application.steps.priority.country')}
                        name="priority_country"
                        placeholder={t('application.steps.priority.countryPlaceholder')}
                        register={register('priority_country')}
                        error={errors.priority_country}
                        helperText={t('application.steps.priority.countryHelper')}
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
