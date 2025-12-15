import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    StepIndicator,
    BasicInfoStep,
    DescriptionStep,
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
import { basicInfoSchema, descriptionSchema, partiesSchema } from '../schemas/applicationSchemas';
import type { BasicInfoFormData, DescriptionFormData, PartiesFormData } from '../schemas/applicationSchemas';
import { PartyType, AttachmentType } from '../types/enums';
import type { Application, CreatePartyDTO } from '../types/applicationTypes';

interface ApplicationFormWizardProps {
    applicationId?: number;
    initialData?: Partial<Application>;
}

const STEPS = [
    { id: 1, titleKey: 'application.steps.basicInfo.title', descriptionKey: 'application.steps.basicInfo.description' },
    { id: 2, titleKey: 'application.steps.descriptionStep.title', descriptionKey: 'application.steps.descriptionStep.description' },
    { id: 3, titleKey: 'application.steps.parties.title', descriptionKey: 'application.steps.parties.description' },
    { id: 4, titleKey: 'application.steps.attachments.title', descriptionKey: 'application.steps.attachments.description' },
    { id: 5, titleKey: 'application.steps.review.title', descriptionKey: 'application.steps.review.description' },
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

    const [currentStep, setCurrentStep] = useState(formStep || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form methods for each step
    const basicInfoMethods = useForm<BasicInfoFormData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            app_type: initialData?.app_type || undefined,
            title: initialData?.title || '',
            abstract: initialData?.abstract || '',
            is_pct: initialData?.is_pct || false,
            pct_number: initialData?.pct_number || '',
            pct_filing_date: initialData?.pct_filing_date || '',
            pct_publication_date: initialData?.pct_publication_date || '',
            priority_date: initialData?.priority_date || '',
            priority_number: initialData?.priority_number || '',
            priority_country: initialData?.priority_country || '',
        },
    });

    const descriptionMethods = useForm<DescriptionFormData>({
        resolver: zodResolver(descriptionSchema),
        defaultValues: {
            description: initialData?.description || '',
            claims: initialData?.claims || '',
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
                : [{
                    party_type: PartyType.APPLICANT,
                    name: '',
                    name_en: null,
                    address: '',
                    address_en: null,
                    nationality: 'Việt Nam',
                    country_code: 'VN',
                    email: null,
                    phone: null,
                    id_number: null,
                    id_type: null,
                    is_primary: true,
                    share_percentage: null,
                }],
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

        switch (currentStep) {
            case 1:
                isValid = await basicInfoMethods.trigger();
                if (isValid) {
                    const data = basicInfoMethods.getValues();
                    // Convert null to undefined for API compatibility
                    const cleanData = {
                        ...data,
                        abstract: data.abstract || undefined,
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
                break;
            case 2:
                isValid = await descriptionMethods.trigger();
                if (isValid && currentApplication?.id) {
                    const data = descriptionMethods.getValues();
                    await dispatch(updateApplication({ id: currentApplication.id, data }));
                }
                break;
            case 3:
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
                            await dispatch(addParty({
                                applicationId: currentApplication.id,
                                data: party as CreatePartyDTO,
                            }));
                        }
                    }
                }
                break;
            case 4:
                isValid = true; // Attachments are optional, always valid
                break;
            default:
                isValid = true;
        }

        if (isValid && currentStep < STEPS.length) {
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
                    abstract: data.abstract || undefined,
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
                    <FormProvider {...descriptionMethods}>
                        <DescriptionStep />
                    </FormProvider>
                );
            case 3:
                return (
                    <FormProvider {...partiesMethods}>
                        <PartiesStep />
                    </FormProvider>
                );
            case 4:
                return (
                    <AttachmentsStep
                        attachments={attachments}
                        onUpload={handleUploadAttachment}
                        onDelete={handleDeleteAttachment}
                        isLoading={loading}
                    />
                );
            case 5:
                return (
                    <FormProvider {...basicInfoMethods}>
                        <ReviewStep
                            application={{
                                ...basicInfoMethods.getValues(),
                                ...descriptionMethods.getValues(),
                                ...currentApplication,
                            }}
                            parties={parties}
                            attachments={attachments}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </FormProvider>
                );
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
