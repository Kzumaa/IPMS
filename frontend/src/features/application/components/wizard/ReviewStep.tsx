import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachmentType, AppType } from '../../types/enums';
import type { Application, ApplicationAttachment, ApplicationParty } from '../../types/applicationTypes';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { calculateFees, fetchFeeQuotes } from '../../store/applicationSlice';

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
    const dispatch = useAppDispatch();
    const { feeQuotes } = useAppSelector(state => state.application);
    const [isCalculatingFees, setIsCalculatingFees] = useState(false);

    const applicants = parties.filter(p => p.party_type === 'APPLICANT');
    const inventors = parties.filter(p => p.party_type === 'INVENTOR');

    // Check if metrics exist
    const hasMetrics = !!application?.metrics;
    const latestFeeQuote = feeQuotes && feeQuotes.length > 0 ? feeQuotes[0] : null;
    const isIndustrialDesign = application?.app_type === AppType.INDUSTRIAL_DESIGN;

    console.log('[ReviewStep] application.metrics:', application?.metrics);
    console.log('[ReviewStep] hasMetrics:', hasMetrics);

    const handleCalculateFees = async () => {
        if (!application?.id) return;

        setIsCalculatingFees(true);
        try {
            await dispatch(calculateFees(application.id)).unwrap();
            // Fetch updated fee quotes
            await dispatch(fetchFeeQuotes(application.id));
        } catch (error) {
            console.error('Fee calculation failed:', error);
        } finally {
            setIsCalculatingFees(false);
        }
    };

    // Check which required document types are uploaded
    const uploadedTypes = useMemo(() => {
        return new Set(attachments.map(att => att.attachment_type));
    }, [attachments]);

    const hasSpecification = uploadedTypes.has(AttachmentType.DESCRIPTION);
    const hasClaims = uploadedTypes.has(AttachmentType.CLAIMS);
    const hasAbstract = uploadedTypes.has(AttachmentType.ABSTRACT);

    // Check if priority documents are needed (now uses priority_claims array)
    const hasPriorityClaim = !!(application?.priority_claims && application.priority_claims.length > 0) ||
                             !!(application?.priority_number || application?.priority_date);
    const hasPriorityDocument = uploadedTypes.has(AttachmentType.PRIORITY_DOC);

    // Check for SNTC info (State Budget Task)
    const hasSntcInfo = !!(application?.sntc_info &&
        (application.sntc_info.agency_name || application.sntc_info.project_name || application.sntc_info.project_code));

    const validationIssues: string[] = [];

    if (!application?.title) validationIssues.push(t('application.steps.review.validation.missingTitle'));
    if (!application?.app_type) validationIssues.push(t('application.steps.review.validation.missingType'));
    if (!hasSpecification) validationIssues.push(t('application.steps.review.validation.missingSpecification'));
    if (!hasClaims) validationIssues.push(t('application.steps.review.validation.missingClaims'));
    if (!hasAbstract) validationIssues.push(t('application.steps.review.validation.missingAbstract'));
    if (applicants.length === 0) validationIssues.push(t('application.steps.review.validation.missingApplicant'));
    if (hasPriorityClaim && !hasPriorityDocument) validationIssues.push(t('application.steps.review.validation.missingPriorityDoc'));
    if (!hasMetrics) validationIssues.push(t('application.steps.review.validation.missingMetrics'));
    if (!latestFeeQuote) validationIssues.push(t('application.steps.review.validation.missingFees'));

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
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {isIndustrialDesign ? t('application.steps.basicInfo.designTitle') : t('application.steps.basicInfo.inventionTitle')}
                        </dt>
                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                            {application?.title || '-'}
                        </dd>
                    </div>

                    {/* Priority Claims (new array-based structure) */}
                    {application?.priority_claims && application.priority_claims.length > 0 && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.steps.priority.title')}</dt>
                            <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                <ul className="space-y-1">
                                    {application.priority_claims.map((claim, idx) => (
                                        <li key={idx} className="bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                                            {claim.number} ({claim.country_code}) - {claim.filing_date}
                                            {claim.kind && <span className="text-xs text-slate-500 ml-2">({t(`application.steps.priority.types.${claim.kind.toLowerCase()}`)})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    )}

                    {/* Legacy priority (backward compatibility) */}
                    {!application?.priority_claims?.length && application?.priority_number && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.priority')}</dt>
                            <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                {application.priority_number} ({application.priority_country}) - {application.priority_date}
                            </dd>
                        </div>
                    )}

                    {/* SNTC Info (State Budget Task) - Industrial Design only */}
                    {isIndustrialDesign && hasSntcInfo && application?.sntc_info && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('application.steps.stateBudget.title')}
                            </dt>
                            <dd className="text-sm text-slate-900 dark:text-white mt-1 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                    {application.sntc_info.agency_name && (
                                        <div>
                                            <span className="text-slate-500">{t('application.steps.stateBudget.agencyName')}:</span>
                                            <span className="ml-1">{application.sntc_info.agency_name}</span>
                                        </div>
                                    )}
                                    {application.sntc_info.project_name && (
                                        <div>
                                            <span className="text-slate-500">{t('application.steps.stateBudget.taskName')}:</span>
                                            <span className="ml-1">{application.sntc_info.project_name}</span>
                                        </div>
                                    )}
                                    {application.sntc_info.project_code && (
                                        <div>
                                            <span className="text-slate-500">{t('application.steps.stateBudget.taskCode')}:</span>
                                            <span className="ml-1">{application.sntc_info.project_code}</span>
                                        </div>
                                    )}
                                </div>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Metrics Summary */}
            <div className={`bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <span className="material-symbols-outlined mr-2 text-indigo-600">analytics</span>
                        {t('application.steps.review.metricsSection')}
                    </h3>
                    {hasMetrics ? (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <span className="material-symbols-outlined mr-1 !text-base">check_circle</span>
                            {t('application.steps.review.metricsComplete')}
                        </span>
                    ) : (
                        <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                            <span className="material-symbols-outlined mr-1 !text-base">warning</span>
                            {t('application.steps.review.metricsMissing')}
                        </span>
                    )}
                </div>

                {hasMetrics && application?.metrics ? (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(application.app_type === AppType.PATENT || application.app_type === AppType.UTILITY) && (
                            <>
                                {application.metrics.description_pages && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.descriptionPages')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.description_pages}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.abstract_pages && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.abstractPages')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.abstract_pages}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.claims_independent && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.independentClaims')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.claims_independent}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.claims_total && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.totalClaims')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.claims_total}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.drawings_images !== null && application.metrics.drawings_images !== undefined && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.drawingImages')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.drawings_images}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.is_user_classified && application.metrics.ipc_groups && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.ipcGroups')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.ipc_groups}
                                        </dd>
                                    </div>
                                )}
                            </>
                        )}
                        {application.app_type === AppType.INDUSTRIAL_DESIGN && (
                            <>
                                {application.metrics.id_variants && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.variants')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.id_variants}
                                        </dd>
                                    </div>
                                )}
                                {application.metrics.id_images_per_variant && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {t('application.steps.attachments.fields.imagesPerVariant')}
                                        </dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {application.metrics.id_images_per_variant}
                                        </dd>
                                    </div>
                                )}
                            </>
                        )}
                    </dl>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('application.steps.review.metricsMissing')}
                    </p>
                )}
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

                    {/* Inventors / Authors / Designers */}
                    {inventors.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                {isIndustrialDesign
                                    ? t('application.steps.parties.authorsDesigners')
                                    : t('application.steps.parties.inventors')} ({inventors.length})
                            </h4>
                            <ul className="space-y-2">
                                {inventors.map((party) => (
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

            {/* Fee Quote Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <span className="material-symbols-outlined mr-2 text-indigo-600">payments</span>
                        {t('application.steps.review.feeSection')}
                    </h3>
                    {latestFeeQuote ? (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <span className="material-symbols-outlined mr-1 !text-base">check_circle</span>
                            {t('application.steps.review.feesCalculated')}
                        </span>
                    ) : (
                        <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                            <span className="material-symbols-outlined mr-1 !text-base">warning</span>
                            {t('application.steps.review.feesNotCalculated')}
                        </span>
                    )}
                </div>

                {latestFeeQuote && latestFeeQuote.lines ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="text-left px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                                            {t('application.steps.review.feeDescription')}
                                        </th>
                                        <th className="text-center px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                                            {t('application.steps.review.units')}
                                        </th>
                                        <th className="text-right px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                                            {t('application.steps.review.unitPrice')}
                                        </th>
                                        <th className="text-right px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">
                                            {t('application.steps.review.amount')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {latestFeeQuote.lines.map((line) => (
                                        <tr key={line.id}>
                                            <td className="px-3 py-2 text-slate-900 dark:text-white">
                                                {line.label}
                                            </td>
                                            <td className="px-3 py-2 text-slate-900 dark:text-white text-center">
                                                {line.units}
                                            </td>
                                            <td className="px-3 py-2 text-slate-900 dark:text-white text-right">
                                                {line.unit_price.toLocaleString()} {latestFeeQuote.currency}
                                            </td>
                                            <td className="px-3 py-2 text-slate-900 dark:text-white text-right">
                                                {line.amount.toLocaleString()} {latestFeeQuote.currency}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-300 dark:border-slate-600">
                                    <tr>
                                        <td colSpan={3} className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                            {t('application.steps.review.totalFee')}
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">
                                            {latestFeeQuote.total_amount.toLocaleString()} {latestFeeQuote.currency}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {t('application.steps.review.feesNotCalculated')}
                    </p>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={handleCalculateFees}
                        disabled={!hasMetrics || isCalculatingFees || !application?.id}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCalculatingFees ? (
                            <>
                                <span className="material-symbols-outlined animate-spin mr-2 !text-base">refresh</span>
                                {t('application.steps.review.calculating')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined mr-2 !text-base">calculate</span>
                                {latestFeeQuote ? t('application.steps.review.recalculateFees') : t('application.steps.review.calculateFees')}
                            </>
                        )}
                    </button>
                </div>
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
