import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { applicationService } from '../features/application/services/applicationService';
import { AmendmentEditor } from '../features/application/components';
import type { AmendmentData, ProposedAmendmentData, NewAttachment } from '../features/application/types/applicationTypes';

const AmendApplicationPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [amendmentData, setAmendmentData] = useState<AmendmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAmendmentData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await applicationService.getAmendmentData(parseInt(id, 10));
                setAmendmentData(response.data);
            } catch (err: unknown) {
                const errorResponse = err as { response?: { data?: { error?: string; has_pending?: boolean } } };
                if (errorResponse.response?.data?.has_pending) {
                    setError(t('amendment.errors.hasPending', 'This application already has a pending amendment request.'));
                } else {
                    setError(errorResponse.response?.data?.error || t('amendment.errors.loadFailed', 'Failed to load amendment data.'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAmendmentData();
    }, [id, t]);

    const handleSubmit = async (
        proposedData: ProposedAmendmentData,
        changeSummary: string,
        newAttachments: NewAttachment[],
        removedAttachmentIds: number[]
    ) => {
        if (!id) return;

        try {
            setIsSubmitting(true);
            await applicationService.createEditModeAmendment(parseInt(id, 10), {
                proposed_data: proposedData,
                change_summary: changeSummary,
                new_attachments: newAttachments,
                removed_attachment_ids: removedAttachmentIds,
            });

            // Navigate back to application detail page with success message
            navigate(`/app/applications/${id}`, {
                state: { message: t('amendment.success', 'Amendment request submitted successfully.') },
            });
        } catch (err: unknown) {
            const errorResponse = err as { response?: { data?: { error?: string } } };
            setError(errorResponse.response?.data?.error || t('amendment.errors.submitFailed', 'Failed to submit amendment.'));
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(`/app/applications/${id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
                    refresh
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                    {t('common.loading', 'Loading...')}
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-4">
                    error
                </span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('amendment.errors.title', 'Cannot Amend Application')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
                <Link
                    to={`/app/applications/${id}`}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    {t('common.backToApplication', 'Back to Application')}
                </Link>
            </div>
        );
    }

    if (!amendmentData) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">
                    description
                </span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('amendment.errors.noData', 'No amendment data available')}
                </h2>
                <Link
                    to={`/app/applications/${id}`}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    {t('common.backToApplication', 'Back to Application')}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <Link
                            to="/app/applications"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            {t('application.list.title', 'Applications')}
                        </Link>
                        <span className="mx-2">/</span>
                        <Link
                            to={`/app/applications/${id}`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            {amendmentData.data.title}
                        </Link>
                        <span className="mx-2">/</span>
                        <span>{t('amendment.title', 'Amend')}</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('amendment.pageTitle', 'Amend Application')}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {t('amendment.pageDescription', 'Make changes to your application. All changes will be reviewed by staff before being applied.')}
                    </p>
                </div>

                {/* Amendment Editor */}
                <AmendmentEditor
                    applicationId={amendmentData.application_id}
                    originalData={amendmentData.data}
                    readonlyFields={amendmentData.readonly_fields}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default AmendApplicationPage;
