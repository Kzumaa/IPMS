import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttachmentType } from '../../types/enums';
import type { ApplicationAttachment } from '../../types/applicationTypes';

interface AttachmentsStepProps {
    attachments: ApplicationAttachment[];
    onUpload: (file: File, type: AttachmentType, description?: string) => Promise<void>;
    onDelete: (attachmentId: number) => Promise<void>;
    isLoading?: boolean;
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
}) => {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState<AttachmentType>(AttachmentType.SPECIFICATION);
    const [description, setDescription] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Get attachment type options from translations
    const attachmentTypeOptions = Object.keys(AttachmentType).map((key) => ({
        value: key as AttachmentType,
        label: t(`application.attachmentTypes.${key}`),
    }));

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

    const handleDelete = async (attachmentId: number) => {
        if (window.confirm(t('application.confirm.deleteAttachment'))) {
            await onDelete(attachmentId);
        }
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
                                                onClick={() => handleDelete(attachment.id)}
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

            {/* Required Documents Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    <span className="material-symbols-outlined align-text-bottom mr-1 !text-base">info</span>
                    {t('application.steps.attachments.requiredDocsTitle')}
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>{t('application.steps.attachments.requiredDocs.specification')}</li>
                    <li>{t('application.steps.attachments.requiredDocs.claims')}</li>
                    <li>{t('application.steps.attachments.requiredDocs.abstract')}</li>
                    <li>{t('application.steps.attachments.requiredDocs.drawings')}</li>
                    <li>{t('application.steps.attachments.requiredDocs.poa')}</li>
                    <li>{t('application.steps.attachments.requiredDocs.priority')}</li>
                </ul>
            </div>
        </div>
    );
};

export default AttachmentsStep;
