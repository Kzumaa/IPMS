import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Application, ApplicationAttachment, ApplicationParty } from '../../types/applicationTypes';

interface ReviewStepProps {
    application: Partial<Application> | null;
    parties: ApplicationParty[];
    attachments: ApplicationAttachment[];
    onSubmit: () => void;
    isSubmitting?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
    application,
    parties,
    attachments,
    onSubmit,
    isSubmitting = false,
}) => {
    const { t } = useTranslation();
    const { formState: { isValid, errors } } = useFormContext();

    const applicants = parties.filter(p => p.party_type === 'APPLICANT');
    const inventors = parties.filter(p => p.party_type === 'INVENTOR');
    const representatives = parties.filter(p => p.party_type === 'REPRESENTATIVE');

    const validationIssues: string[] = [];

    if (!application?.title) validationIssues.push(t('application.steps.review.validation.missingTitle'));
    if (!application?.app_type) validationIssues.push(t('application.steps.review.validation.missingType'));
    if (!application?.description) validationIssues.push(t('application.steps.review.validation.missingDescription'));
    if (!application?.claims) validationIssues.push(t('application.steps.review.validation.missingClaims'));
    if (applicants.length === 0) validationIssues.push(t('application.steps.review.validation.missingApplicant'));

    const isReadyToSubmit = validationIssues.length === 0;

    return (
        <div className="space-y-6">
            {/* Validation Status */}
            <div className={`rounded-lg p-4 ${isReadyToSubmit ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                <div className="flex items-start">
                    <span className={`material-symbols-outlined mr-3 ${isReadyToSubmit ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isReadyToSubmit ? 'check_circle' : 'warning'}
                    </span>
                    <div>
                        <h4 className={`font-medium ${isReadyToSubmit ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
                            {isReadyToSubmit ? t('application.steps.review.readyToSubmit') : t('application.steps.review.notReady')}
                        </h4>
                        {!isReadyToSubmit && (
                            <ul className="mt-2 text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
                                {validationIssues.map((issue, index) => (
                                    <li key={index}>{issue}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Basic Info Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-indigo-600">article</span>
                    {t('application.steps.review.basicInfo')}
                </h3>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.table.appType')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                            {application?.app_type ? t(`application.appTypes.${application.app_type}`) : '-'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.pctApplication')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                            {application?.is_pct ? `${t('common.yes')} (${application.pct_number || '-'})` : t('common.no')}
                        </dd>
                    </div>

                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.steps.basicInfo.inventionTitle')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                            {application?.title || '-'}
                        </dd>
                    </div>

                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.steps.basicInfo.abstract')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white mt-1 whitespace-pre-wrap">
                            {application?.abstract || '-'}
                        </dd>
                    </div>

                    {application?.priority_number && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.priority')}</dt>
                            <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                {application.priority_number} ({application.priority_country}) - {application.priority_date}
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Parties Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-indigo-600">group</span>
                    {t('application.steps.review.parties')}
                </h3>

                <div className="space-y-4">
                    {/* Applicants */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('application.steps.parties.applicants')} ({applicants.length})
                        </h4>
                        {applicants.length > 0 ? (
                            <ul className="space-y-2">
                                {applicants.map((party) => (
                                    <li key={party.id} className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                        <strong>{party.name}</strong>
                                        {party.email && <span className="text-slate-500"> • {party.email}</span>}
                                        <br />
                                        <span className="text-slate-500 dark:text-slate-400 text-xs">{party.address}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-red-500">{t('application.steps.parties.noApplicants')}</p>
                        )}
                    </div>

                    {/* Inventors */}
                    {inventors.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('application.steps.parties.inventors')} ({inventors.length})
                            </h4>
                            <ul className="space-y-2">
                                {inventors.map((party) => (
                                    <li key={party.id} className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                        {party.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Representatives */}
                    {representatives.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {t('application.steps.parties.representatives')} ({representatives.length})
                            </h4>
                            <ul className="space-y-2">
                                {representatives.map((party) => (
                                    <li key={party.id} className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                        {party.name}
                                        {party.email && <span className="text-slate-500"> • {party.email}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Attachments Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-indigo-600">attach_file</span>
                    {t('application.steps.review.attachments', { count: attachments.length })}
                </h3>

                {attachments.length > 0 ? (
                    <ul className="space-y-2">
                        {attachments.map((attachment) => (
                            <li key={attachment.id} className="flex items-center text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                <span className="material-symbols-outlined text-slate-500 mr-2 !text-lg">description</span>
                                <span className="flex-1">{attachment.file_name}</span>
                                <span className="text-slate-500 text-xs">
                                    {t(`application.attachmentTypes.${attachment.attachment_type}`)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('application.detail.noAttachments')}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!isReadyToSubmit || isSubmitting}
                    className={`
            flex items-center px-6 py-3 rounded-lg font-medium transition-colors
            ${isReadyToSubmit && !isSubmitting
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                            {t('application.steps.review.submitting')}
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined mr-2">send</span>
                            {t('application.steps.review.submit')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewStep;
