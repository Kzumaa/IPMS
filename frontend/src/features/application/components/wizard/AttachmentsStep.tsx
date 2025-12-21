import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachmentType, AppType } from '../../types/enums';
import type { ApplicationAttachment, ApplicationMetric } from '../../types/applicationTypes';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useAppDispatch } from '../../../../store/hooks';
import { saveMetrics } from '../../store/applicationSlice';

interface RequiredDocument {
    type: AttachmentType;
    labelKey: string;
    required: boolean;
    condition?: string; // Translation key for condition description
}

interface AttachmentsStepProps {
    attachments: ApplicationAttachment[];
    onUpload: (file: File, type: AttachmentType, description?: string) => Promise<void>;
    onDelete: (attachmentId: number) => Promise<void>;
    isLoading?: boolean;
    // Contextual info for conditional validation
    isPct?: boolean;
    hasPriorityClaim?: boolean;
    hasRepresentative?: boolean;
    // Metrics
    appType: AppType;
    applicationId?: number;
    existingMetrics?: ApplicationMetric;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentsStep: React.FC<AttachmentsStepProps> = ({
    attachments,
    onUpload,
    onDelete,
    isLoading = false,
    // isPct is available for future use when PCT-specific docs are needed
    isPct: _isPct = false,
    hasPriorityClaim = false,
    hasRepresentative = false,
    appType,
    applicationId,
    existingMetrics,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [selectedType, setSelectedType] = useState<AttachmentType>(AttachmentType.DESCRIPTION);
    const [description, setDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; attachmentId: number | null }>({
        isOpen: false,
        attachmentId: null,
    });

    // Metrics state
    const [metrics, setMetrics] = useState<Partial<ApplicationMetric>>({
        description_pages: undefined,
        abstract_pages: undefined,
        claims_independent: undefined,
        claims_total: undefined,
        drawings_images: undefined,
        ipc_groups: undefined,
        id_variants: undefined,
        id_images_per_variant: undefined,
        has_priority: hasPriorityClaim,
        priority_count: hasPriorityClaim ? 1 : undefined,
        is_user_classified: false,
    });
    const [metricsSaved, setMetricsSaved] = useState(false);
    const [savingMetrics, setSavingMetrics] = useState(false);

    // Populate metrics from existingMetrics
    useEffect(() => {
        if (existingMetrics) {
            setMetrics(existingMetrics);
            setMetricsSaved(true);
        }
    }, [existingMetrics]);

    // Update has_priority when priority claim changes
    useEffect(() => {
        setMetrics(prev => ({
            ...prev,
            has_priority: hasPriorityClaim,
            priority_count: hasPriorityClaim ? (prev.priority_count || 1) : undefined,
        }));
    }, [hasPriorityClaim]);

    // Auto-suggest metrics based on attachments when they change
    useEffect(() => {
        // Count drawing attachments
        const drawingsCount = attachments.filter(att => att.attachment_type === AttachmentType.DRAWINGS).length;

        setMetrics(prev => ({
            ...prev,
            // Suggest drawings count based on uploaded files
            drawings_images: drawingsCount > 0 ? (prev.drawings_images || drawingsCount) : prev.drawings_images,
            // Note: description_pages, claims counts need manual entry or backend analysis
            // The backend should analyze uploaded PDFs and provide page counts
        }));
    }, [attachments]);

    // Get attachment type options from translations
    const attachmentTypeOptions = Object.keys(AttachmentType).map((key) => ({
        value: key as AttachmentType,
        label: t(`application.attachmentTypes.${key}`),
    }));

    // Define required documents based on context
    const requiredDocuments: RequiredDocument[] = useMemo(() => {
        const docs: RequiredDocument[] = [
            { type: AttachmentType.DESCRIPTION, labelKey: 'application.steps.attachments.requiredDocs.specification', required: true },
            { type: AttachmentType.CLAIMS, labelKey: 'application.steps.attachments.requiredDocs.claims', required: true },
            { type: AttachmentType.ABSTRACT, labelKey: 'application.steps.attachments.requiredDocs.abstract', required: true },
            { type: AttachmentType.DRAWINGS, labelKey: 'application.steps.attachments.requiredDocs.drawings', required: false },
        ];

        if (hasPriorityClaim) {
            docs.push({
                type: AttachmentType.PRIORITY_DOC,
                labelKey: 'application.steps.attachments.requiredDocs.priority',
                required: true,
                condition: 'application.steps.attachments.conditionPriority',
            });
        }

        if (hasRepresentative) {
            docs.push({
                type: AttachmentType.POA,
                labelKey: 'application.steps.attachments.requiredDocs.poa',
                required: true,
                condition: 'application.steps.attachments.conditionPoa',
            });
        }

        return docs;
    }, [hasPriorityClaim, hasRepresentative]);

    // Check which required documents are missing
    const missingDocuments = useMemo(() => {
        return requiredDocuments.filter(doc => {
            if (!doc.required) return false;
            return !attachments.some(att => att.attachment_type === doc.type);
        });
    }, [requiredDocuments, attachments]);

    // Check which documents are uploaded
    const uploadedTypes = useMemo(() => {
        return new Set(attachments.map(att => att.attachment_type));
    }, [attachments]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleUpload(files[0]);
        }
    }, [selectedType, description]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleUpload(files[0]);
        }
        e.target.value = ''; // Reset input
    };

    const handleUpload = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            alert(t('validation.fileSize', { max: '10MB' }));
            return;
        }

        setUploading(true);
        try {
            await onUpload(file, selectedType, description || undefined);
            setDescription('');
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (attachmentId: number) => {
        setDeleteConfirm({ isOpen: true, attachmentId });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.attachmentId !== null) {
            await onDelete(deleteConfirm.attachmentId);
        }
        setDeleteConfirm({ isOpen: false, attachmentId: null });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, attachmentId: null });
    };

    const handleSaveMetrics = async () => {
        if (!applicationId) return;

        console.log('[AttachmentsStep] Saving metrics:', metrics);
        setSavingMetrics(true);
        try {
            const result = await dispatch(saveMetrics({
                applicationId,
                data: metrics,
            })).unwrap();

            console.log('[AttachmentsStep] Metrics saved successfully:', result);
            setMetricsSaved(true);
        } catch (error) {
            console.error('[AttachmentsStep] Failed to save metrics:', error);
        } finally {
            setSavingMetrics(false);
        }
    };

    const handleMetricChange = (field: keyof ApplicationMetric, value: number | boolean | null | undefined) => {
        setMetrics(prev => ({
            ...prev,
            [field]: value,
        }));
        setMetricsSaved(false);

    };

    const groupedAttachments = attachments.reduce((acc, attachment) => {
        const type = attachment.attachment_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(attachment);
        return acc;
    }, {} as Record<AttachmentType, ApplicationAttachment[]>);

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.attachments.uploadTitle')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.steps.attachments.attachmentType')}
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as AttachmentType)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {attachmentTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.steps.attachments.descriptionField')}
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('application.steps.attachments.descriptionPlaceholder')}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                        }
            ${uploading || isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading || isLoading}
                    />

                    <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 mb-2">
                        cloud_upload
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                        {uploading ? t('application.steps.attachments.uploading') : t('application.steps.attachments.dropzone')}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                        {t('application.steps.attachments.dropzoneFormats')}
                    </p>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('application.steps.attachments.metricsTitle')}
                    </h3>
                    {metricsSaved && (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <span className="material-symbols-outlined mr-1 !text-base">check_circle</span>
                            {t('application.steps.attachments.metricsSaved')}
                        </span>
                    )}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('application.steps.attachments.metricsDescription')}
                </p>

                {/* Helper Note */}
                {(uploadedTypes.has(AttachmentType.DESCRIPTION) || uploadedTypes.has(AttachmentType.CLAIMS)) && !metricsSaved && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mr-2 !text-base">info</span>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {t('application.steps.attachments.metricsHelper')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Patent/Utility Metrics - Fields appear based on uploaded files */}
                {(appType === AppType.PATENT || appType === AppType.UTILITY) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Description Pages - only show if DESCRIPTION file uploaded */}
                        {uploadedTypes.has(AttachmentType.DESCRIPTION) && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('application.steps.attachments.fields.descriptionPages')} *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={metrics.description_pages || ''}
                                    onChange={(e) => handleMetricChange('description_pages', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {/* Abstract Pages - only show if ABSTRACT file uploaded */}
                        {uploadedTypes.has(AttachmentType.ABSTRACT) && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('application.steps.attachments.fields.abstractPages')} *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={metrics.abstract_pages || ''}
                                    onChange={(e) => handleMetricChange('abstract_pages', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {/* Claims - only show if CLAIMS file uploaded */}
                        {uploadedTypes.has(AttachmentType.CLAIMS) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.attachments.fields.independentClaims')} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={metrics.claims_independent || ''}
                                        onChange={(e) => handleMetricChange('claims_independent', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.attachments.fields.totalClaims')} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={metrics.claims_total || ''}
                                        onChange={(e) => handleMetricChange('claims_total', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </>
                        )}

                        {/* Drawings - only show if DRAWINGS file uploaded */}
                        {uploadedTypes.has(AttachmentType.DRAWINGS) && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('application.steps.attachments.fields.drawingImages')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={metrics.drawings_images || ''}
                                    onChange={(e) => handleMetricChange('drawings_images', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {/* IPC Classification - show if DESCRIPTION or CLAIMS uploaded */}
                        {(uploadedTypes.has(AttachmentType.DESCRIPTION) || uploadedTypes.has(AttachmentType.CLAIMS)) && (
                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={metrics.is_user_classified || false}
                                        onChange={(e) => handleMetricChange('is_user_classified', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {t('application.steps.attachments.fields.userClassified')}
                                    </span>
                                </label>
                            </div>
                        )}

                        {metrics.is_user_classified && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {t('application.steps.attachments.fields.ipcGroups')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={metrics.ipc_groups || ''}
                                    onChange={(e) => handleMetricChange('ipc_groups', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Industrial Design Metrics - Fields appear based on uploaded files */}
                {appType === AppType.INDUSTRIAL_DESIGN && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Show fields only if DRAWINGS or DESCRIPTION uploaded */}
                        {(uploadedTypes.has(AttachmentType.DRAWINGS) || uploadedTypes.has(AttachmentType.DESCRIPTION)) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.attachments.fields.variants')} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={metrics.id_variants || ''}
                                        onChange={(e) => handleMetricChange('id_variants', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.attachments.fields.imagesPerVariant')} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={metrics.id_images_per_variant || ''}
                                        onChange={(e) => handleMetricChange('id_images_per_variant', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder={t('application.steps.attachments.metricsPlaceholder')}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Save Metrics Button */}
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        * {t('common.required')}
                    </p>
                    <button
                        type="button"
                        onClick={handleSaveMetrics}
                        disabled={savingMetrics || !applicationId}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {savingMetrics ? (
                            <>
                                <span className="material-symbols-outlined animate-spin mr-2 !text-base">refresh</span>
                                {t('common.saving')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined mr-2 !text-base">save</span>
                                {t('application.steps.attachments.saveMetrics')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Uploaded Files */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.attachments.uploadedFiles', { count: attachments.length })}
                </h3>

                {attachments.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">folder_open</span>
                        <p className="text-slate-500 dark:text-slate-400">{t('application.steps.attachments.noFiles')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedAttachments).map(([type, files]) => (
                            <div key={type}>
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t(`application.attachmentTypes.${type}`)}
                                </h4>
                                <div className="space-y-2">
                                    {files.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                                        >
                                            <div className="flex items-center min-w-0">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-3">
                                                    description
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                        {attachment.file_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatFileSize(attachment.file_size)}
                                                        {attachment.description && ` • ${attachment.description}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(attachment.id)}
                                                className="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                disabled={isLoading}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Required Documents Info with Status */}
            <div className={`rounded-lg p-4 ${missingDocuments.length > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <h4 className={`text-sm font-medium mb-3 ${missingDocuments.length > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                    <span className="material-symbols-outlined align-text-bottom mr-1 !text-base">
                        {missingDocuments.length > 0 ? 'warning' : 'check_circle'}
                    </span>
                    {t('application.steps.attachments.requiredDocsTitle')}
                    {missingDocuments.length > 0 && (
                        <span className="ml-2 text-xs font-normal">
                            ({t('application.steps.attachments.missingCount', { count: missingDocuments.length })})
                        </span>
                    )}
                </h4>
                <ul className="space-y-2">
                    {requiredDocuments.map((doc) => {
                        const isUploaded = uploadedTypes.has(doc.type);
                        return (
                            <li key={doc.type} className="flex items-center text-sm">
                                <span className={`material-symbols-outlined mr-2 !text-base ${isUploaded
                                    ? 'text-green-600 dark:text-green-400'
                                    : doc.required
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                    {isUploaded ? 'check_circle' : doc.required ? 'radio_button_unchecked' : 'remove'}
                                </span>
                                <span className={`${isUploaded
                                    ? 'text-green-700 dark:text-green-400'
                                    : doc.required
                                        ? 'text-amber-700 dark:text-amber-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {t(doc.labelKey)}
                                    {doc.condition && (
                                        <span className="text-xs ml-1 opacity-75">
                                            ({t(doc.condition)})
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('application.confirm.deleteAttachmentTitle')}
                message={t('application.confirm.deleteAttachment')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default AttachmentsStep;
