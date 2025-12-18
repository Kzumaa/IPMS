import React, { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    StepIndicator,
    BasicInfoStep,
    PartiesStep,
    AttachmentsStep,
    ReviewStep,
} from './wizard';
import {
    createApplication,
    updateApplication,
    submitApplication,
    uploadAttachment,
    deleteAttachment,
    addParty,
    setFormStep,
    clearCurrentApplication,
} from '../store/applicationSlice';
import { basicInfoSchema, partiesSchema } from '../schemas/applicationSchemas';
import type { BasicInfoFormData, PartiesFormData } from '../schemas/applicationSchemas';
import { PartyType, AttachmentType } from '../types/enums';
import type { Application, CreatePartyDTO } from '../types/applicationTypes';

interface ApplicationFormWizardProps {
    applicationId?: number;
    initialData?: Partial<Application>;
}

const STEPS = [
    { id: 1, titleKey: 'application.steps.basicInfo.title', descriptionKey: 'application.steps.basicInfo.description' },
    { id: 2, titleKey: 'application.steps.parties.title', descriptionKey: 'application.steps.parties.description' },
    { id: 3, titleKey: 'application.steps.attachments.title', descriptionKey: 'application.steps.attachments.description' },
    { id: 4, titleKey: 'application.steps.review.title', descriptionKey: 'application.steps.review.description' },
];

const ApplicationFormWizard: React.FC<ApplicationFormWizardProps> = ({
    applicationId,
    initialData,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentApplication, parties, attachments, loading, error, formStep } = useAppSelector(
        (state) => state.application
    );
    const { user } = useAppSelector((state) => state.auth);

    const [currentStep, setCurrentStep] = useState(formStep || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create default applicant from logged-in user data
    const defaultApplicantFromUser = useMemo(() => ({
        party_type: PartyType.APPLICANT,
        name: user?.is_org ? (user?.org_name || '') : (user?.full_name || ''),
        address: user?.address || '',
        nationality: 'Việt Nam',
        country_code: user?.country || 'VN',
        email: user?.email || null,
        phone: user?.phone || null,
        id_number: user?.citizen_id || null,
        id_type: user?.citizen_id ? 'CCCD' : null,
        is_primary: true,
        share_percentage: null,
    }), [user]);

    // Form methods for each step
    const basicInfoMethods = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            app_type: initialData?.app_type || undefined,
            title: initialData?.title || '',
            is_pct: initialData?.is_pct || false,
            pct_number: initialData?.pct_number || '',
            pct_filing_date: initialData?.pct_filing_date || '',
            pct_publication_date: initialData?.pct_publication_date || '',
            priority_date: initialData?.priority_date || '',
            priority_number: initialData?.priority_number || '',
            priority_country: initialData?.priority_country || '',
        },
    });

    const partiesMethods = useForm<PartiesFormData>({
        resolver: zodResolver(partiesSchema),
        defaultValues: {
            applicants: parties.filter(p => p.party_type === 'APPLICANT').length > 0
                ? parties.filter(p => p.party_type === 'APPLICANT').map(p => ({
                    ...p,
                    is_primary: p.is_primary ?? false,
                }))
                : [defaultApplicantFromUser],
            inventors: parties.filter(p => p.party_type === 'INVENTOR').map(p => ({
                ...p,
                is_primary: p.is_primary ?? false,
            })),
            representatives: parties.filter(p => p.party_type === 'REPRESENTATIVE').map(p => ({
                ...p,
                is_primary: p.is_primary ?? false,
            })),
        },
    });

    useEffect(() => {
        dispatch(setFormStep(currentStep));
    }, [currentStep, dispatch]);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            dispatch(clearCurrentApplication());
        };
    }, [dispatch]);

    const handleNext = async () => {
        let isValid = false;
        let hasApiError = false;

        switch (currentStep) {
            case 1:
                isValid = await basicInfoMethods.trigger();
                if (isValid) {
                    const data = basicInfoMethods.getValues();
                    // Convert null to undefined for API compatibility
                    const cleanData = {
                        ...data,
                        pct_number: data.pct_number || undefined,
                        pct_filing_date: data.pct_filing_date || undefined,
                        pct_publication_date: data.pct_publication_date || undefined,
                        priority_date: data.priority_date || undefined,
                        priority_number: data.priority_number || undefined,
                        priority_country: data.priority_country || undefined,
                    };
                    if (currentApplication?.id) {
                        const result = await dispatch(updateApplication({ id: currentApplication.id, data: cleanData }));
                        hasApiError = updateApplication.rejected.match(result);
                    } else {
                        const result = await dispatch(createApplication(cleanData));
                        hasApiError = createApplication.rejected.match(result);
                    }
                }
                break;
            case 2:
                isValid = await partiesMethods.trigger();
                if (isValid && currentApplication?.id) {
                    // Save parties
                    const formData = partiesMethods.getValues();
                    const allParties = [
                        ...formData.applicants.map(p => ({ ...p, party_type: PartyType.APPLICANT })),
                        ...(formData.inventors || []).map(p => ({ ...p, party_type: PartyType.INVENTOR })),
                        ...(formData.representatives || []).map(p => ({ ...p, party_type: PartyType.REPRESENTATIVE })),
                    ];

                    for (const party of allParties) {
                        const partyWithId = party as { id?: number } & typeof party;
                        if (!partyWithId.id) {
                            const result = await dispatch(addParty({
                                applicationId: currentApplication.id,
                                data: party as CreatePartyDTO,
                            }));
                            if (addParty.rejected.match(result)) {
                                hasApiError = true;
                                break; // Stop on first error
                            }
                        }
                    }
                }
                break;
            case 3:
                // Check if metrics have been saved (required for fee calculation)
                if (!currentApplication?.metrics) {
                    alert(t('application.steps.attachments.metricsMustBeSaved'));
                    isValid = false;
                } else {
                    isValid = true;
                }
                break;
            default:
                isValid = true;
        }

        if (isValid && !hasApiError && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (step: number) => {
        if (step <= currentStep) {
            setCurrentStep(step);
        }
    };

    const handleUploadAttachment = async (file: File, type: AttachmentType, description?: string) => {
        if (!currentApplication?.id) return;

        await dispatch(uploadAttachment({
            applicationId: currentApplication.id,
            data: { file, attachment_type: type, description },
        }));
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!currentApplication?.id) return;

        await dispatch(deleteAttachment({
            applicationId: currentApplication.id,
            attachmentId,
        }));
    };

    const handleSubmit = async () => {
        if (!currentApplication?.id) return;

        setIsSubmitting(true);
        try {
            const result = await dispatch(submitApplication(currentApplication.id));
            if (submitApplication.fulfilled.match(result)) {
                navigate('/app/applications');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (currentStep === 1) {
            const isValid = await basicInfoMethods.trigger();
            if (isValid) {
                const data = basicInfoMethods.getValues();
                const cleanData = {
                    ...data,
                    pct_number: data.pct_number || undefined,
                    pct_filing_date: data.pct_filing_date || undefined,
                    pct_publication_date: data.pct_publication_date || undefined,
                    priority_date: data.priority_date || undefined,
                    priority_number: data.priority_number || undefined,
                    priority_country: data.priority_country || undefined,
                };
                if (currentApplication?.id) {
                    await dispatch(updateApplication({ id: currentApplication.id, data: cleanData }));
                } else {
                    await dispatch(createApplication(cleanData));
                }
            }
        }

        navigate('/app/applications');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FormProvider {...basicInfoMethods}>
                        <BasicInfoStep />
                    </FormProvider>
                );
            case 2:
                return (
                    <FormProvider {...partiesMethods}>
                        <PartiesStep />
                    </FormProvider>
                );
            case 3: {
                // Get contextual info for conditional document requirements
                const basicInfo = basicInfoMethods.getValues();
                const hasPriorityClaim = !!(basicInfo.priority_number || basicInfo.priority_date);
                const hasRepresentative = (partiesMethods.getValues().representatives || []).length > 0;

                return (
                    <AttachmentsStep
                        attachments={attachments}
                        onUpload={handleUploadAttachment}
                        onDelete={handleDeleteAttachment}
                        isLoading={loading}
                        isPct={basicInfo.is_pct}
                        hasPriorityClaim={hasPriorityClaim}
                        hasRepresentative={hasRepresentative}
                        appType={basicInfo.app_type}
                        applicationId={currentApplication?.id}
                        existingMetrics={currentApplication?.metrics}
                    />
                );
            }
            case 4: {
                const reviewApplication = {
                    ...currentApplication,
                    ...basicInfoMethods.getValues(),
                };
                console.log('[ApplicationFormWizard] ReviewStep - currentApplication.metrics:', currentApplication?.metrics);
                console.log('[ApplicationFormWizard] ReviewStep - reviewApplication.metrics:', reviewApplication.metrics);
                return (
                    <FormProvider {...basicInfoMethods}>
                        <ReviewStep
                            application={reviewApplication}
                            parties={parties}
                            attachments={attachments}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </FormProvider>
                );
            }
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {applicationId ? t('application.form.editTitle') : t('application.form.createTitle')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {t('application.form.subtitle')}
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                </div>
            )}

            {/* Step Indicator */}
            <StepIndicator
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={handleStepClick}
            />

            {/* Step Content */}
            <div className="mb-8">
                {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {t('application.form.saveDraft')}
                    </button>
                </div>

                <div className="flex items-center space-x-3">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={loading}
                            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined mr-1 !text-lg">chevron_left</span>
                            {t('application.form.back')}
                        </button>
                    )}

                    {currentStep < STEPS.length && (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={loading}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin mr-1 !text-lg">refresh</span>
                                    {t('application.form.processing')}
                                </>
                            ) : (
                                <>
                                    {t('application.form.next')}
                                    <span className="material-symbols-outlined ml-1 !text-lg">chevron_right</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationFormWizard;
