import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormTextarea } from '../forms';
import type { DescriptionFormData } from '../../schemas/applicationSchemas';

const DescriptionStep: React.FC = () => {
    const { t } = useTranslation();
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<DescriptionFormData>();

    const descriptionValue = watch('description') || '';
    const claimsValue = watch('claims') || '';

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {t('application.steps.descriptionStep.sectionTitle')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {t('application.steps.descriptionStep.sectionDesc')}
                </p>

                <FormTextarea
                    label={t('application.steps.descriptionStep.descriptionLabel')}
                    name="description"
                    placeholder={t('application.steps.descriptionStep.descriptionPlaceholder')}
                    rows={12}
                    maxLength={100000}
                    currentLength={descriptionValue.length}
                    required
                    register={register('description')}
                    error={errors.description}
                />

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                        <span className="material-symbols-outlined align-text-bottom mr-1 !text-base">info</span>
                        {t('application.steps.descriptionStep.guideTitle')}
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                        <li>{t('application.steps.descriptionStep.guideItems.field')}</li>
                        <li>{t('application.steps.descriptionStep.guideItems.priorArt')}</li>
                        <li>{t('application.steps.descriptionStep.guideItems.essence')}</li>
                        <li>{t('application.steps.descriptionStep.guideItems.drawings')}</li>
                        <li>{t('application.steps.descriptionStep.guideItems.embodiments')}</li>
                        <li>{t('application.steps.descriptionStep.guideItems.examples')}</li>
                    </ul>
                </div>
            </div>

            {/* Claims */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {t('application.steps.descriptionStep.claimsTitle')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {t('application.steps.descriptionStep.claimsDesc')}
                </p>

                <FormTextarea
                    label={t('application.steps.descriptionStep.claimsLabel')}
                    name="claims"
                    placeholder={t('application.steps.descriptionStep.claimsPlaceholder')}
                    rows={10}
                    maxLength={50000}
                    currentLength={claimsValue.length}
                    required
                    register={register('claims')}
                    error={errors.claims}
                />

                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                        <span className="material-symbols-outlined align-text-bottom mr-1 !text-base">lightbulb</span>
                        {t('application.steps.descriptionStep.claimsNoteTitle')}
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                        <li>{t('application.steps.descriptionStep.claimsNotes.independent')}</li>
                        <li>{t('application.steps.descriptionStep.claimsNotes.dependent')}</li>
                        <li>{t('application.steps.descriptionStep.claimsNotes.sentence')}</li>
                        <li>{t('application.steps.descriptionStep.claimsNotes.language')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DescriptionStep;
