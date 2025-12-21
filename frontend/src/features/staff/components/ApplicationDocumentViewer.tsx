import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PDFViewer from '@/components/PDFViewer';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import axiosClient from '@/api/axiosClient';
import { downloadFile } from '@/utils/fileDownload';
import type { ApplicationAttachment } from '@/features/application/types/applicationTypes';

interface ApplicationDocumentViewerProps {
    attachments: ApplicationAttachment[];
    applicationId: number;
}

export default function ApplicationDocumentViewer({ attachments, applicationId }: ApplicationDocumentViewerProps) {
    const { t } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState<ApplicationAttachment | null>(
        attachments.length > 0 ? attachments[0] : null
    );
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Fetch file URL when selected document changes
    useEffect(() => {
        let activeUrl: string | null = null;

        const fetchFileUrl = async () => {
            if (!selectedDoc) {
                setFileUrl(null);
                return;
            }

            setLoadingFile(true);
            setFileError(null);

            try {
                // Fetch the file content directly from backend proxy as a blob
                // This handles Auth headers via axiosClient and avoids CORS issues with R2
                const response = await axiosClient.get(
                    `/applications/${applicationId}/attachments/${selectedDoc.id}/preview`,
                    { responseType: 'blob' }
                );

                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                activeUrl = URL.createObjectURL(blob);
                setFileUrl(activeUrl);
            } catch (error) {
                console.error('Failed to fetch file URL:', error);
                setFileError('Failed to load file. Please try downloading instead.');
            } finally {
                setLoadingFile(false);
            }
        };

        fetchFileUrl();

        // Cleanup
        return () => {
            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [selectedDoc, applicationId]);

    const getDocTypeIcon = (docType: string) => {
        switch (docType) {
            case 'DESCRIPTION':
                return 'description';
            case 'CLAIMS':
                return 'gavel';
            case 'ABSTRACT':
                return 'article';
            case 'DRAWINGS':
                return 'image';
            case 'PRIORITY_DOC':
                return 'priority_high';
            case 'POA':
                return 'badge';
            default:
                return 'attach_file';
        }
    };

    const getDocTypeColor = (docType: string) => {
        switch (docType) {
            case 'DESCRIPTION':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            case 'CLAIMS':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
            case 'ABSTRACT':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'DRAWINGS':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
            case 'PRIORITY_DOC':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            case 'POA':
                return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';
        }
    };

    const handleDownload = async (attachment: ApplicationAttachment) => {
        try {
            const response = await axiosClient.get(
                `/applications/${applicationId}/attachments/${attachment.id}/download`
            );
            const downloadUrl = response.data.data.url;
            const filename = response.data.data.filename || attachment.file_name;

            // Use the proper download utility
            await downloadFile(downloadUrl, filename);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    const handleOpenPreviewModal = () => {
        if (selectedDoc) {
            setShowPreviewModal(true);
        }
    };

    const isPdf = selectedDoc?.file_name.toLowerCase().endsWith('.pdf');
    const isImage = selectedDoc?.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (attachments.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">
                        folder_open
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t('staff.documentViewer.noDocuments')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-indigo-600">folder_open</span>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('staff.documentViewer.title')}
                    </h3>
                    <span className="ml-auto bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
                        {attachments.length} {t('staff.documentViewer.documents')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Document List */}
                <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-700">
                    <div className="p-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            {t('staff.documentViewer.documentList')}
                        </h4>
                        <div className="space-y-2">
                            {attachments.map((attachment) => (
                                <button
                                    key={attachment.id}
                                    onClick={() => setSelectedDoc(attachment)}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedDoc?.id === attachment.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`material-symbols-outlined text-lg ${getDocTypeColor(attachment.attachment_type)}`}>
                                            {getDocTypeIcon(attachment.attachment_type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                                    {attachment.attachment_type}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {attachment.file_name}
                                            </p>
                                            {attachment.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                                    {attachment.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Document Preview/Details */}
                <div className="lg:col-span-2 p-6">
                    {selectedDoc ? (
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${getDocTypeColor(selectedDoc.attachment_type)}`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {getDocTypeIcon(selectedDoc.attachment_type)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            {selectedDoc.file_name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {t(`staff.documentViewer.docTypes.${selectedDoc.attachment_type}`)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(isPdf || isImage) && (
                                        <button
                                            onClick={handleOpenPreviewModal}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">fullscreen</span>
                                            <span className="text-sm font-medium hidden sm:inline">
                                                {t('common.view')}
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDownload(selectedDoc)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">download</span>
                                        <span className="text-sm font-medium">
                                            {t('staff.documentViewer.download')}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Document Details */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    {t('staff.documentViewer.details')}
                                </h4>
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">
                                            {t('staff.documentViewer.documentType')}
                                        </dt>
                                        <dd className="font-medium text-slate-900 dark:text-white">
                                            {t(`staff.documentViewer.docTypes.${selectedDoc.attachment_type}`)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">
                                            {t('staff.documentViewer.fileName')}
                                        </dt>
                                        <dd className="font-medium text-slate-900 dark:text-white truncate">
                                            {selectedDoc.file_name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500 dark:text-slate-400 mb-1">
                                            {t('staff.documentViewer.uploadedAt')}
                                        </dt>
                                        <dd className="font-medium text-slate-900 dark:text-white">
                                            {selectedDoc.created_at
                                                ? new Date(selectedDoc.created_at).toLocaleString()
                                                : '-'
                                            }
                                        </dd>
                                    </div>
                                    {selectedDoc.description && (
                                        <div className="col-span-2">
                                            <dt className="text-slate-500 dark:text-slate-400 mb-1">
                                                {t('staff.documentViewer.notes')}
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-white">
                                                {selectedDoc.description}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Inline Preview Area */}
                            <div className="rounded-lg overflow-hidden">
                                {loadingFile ? (
                                    <div className="flex items-center justify-center h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-5xl text-indigo-600 animate-spin mb-4">
                                                refresh
                                            </span>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {t('common.loading')}
                                            </p>
                                        </div>
                                    </div>
                                ) : fileError ? (
                                    <div className="flex items-center justify-center h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                                        <div className="text-center p-8">
                                            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                                                error
                                            </span>
                                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                {fileError}
                                            </p>
                                            <button
                                                onClick={() => handleDownload(selectedDoc)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                <span className="text-sm font-medium">
                                                    {t('staff.documentViewer.download')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ) : fileUrl && isPdf ? (
                                    <div className="h-[400px]">
                                        <PDFViewer
                                            fileUrl={fileUrl}
                                            fileName={selectedDoc.file_name}
                                            onDownload={() => handleDownload(selectedDoc)}
                                        />
                                    </div>
                                ) : fileUrl && isImage ? (
                                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-center h-[400px]">
                                        <img
                                            src={fileUrl}
                                            alt={selectedDoc.file_name}
                                            className="max-w-full max-h-full object-contain cursor-pointer"
                                            onClick={handleOpenPreviewModal}
                                        />
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                                                description
                                            </span>
                                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                {t('staff.documentViewer.previewNotAvailable')}
                                            </p>
                                            <button
                                                onClick={() => handleDownload(selectedDoc)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                <span className="text-sm font-medium">
                                                    {t('staff.documentViewer.downloadToView')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full py-12">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">
                                    mouse
                                </span>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {t('staff.documentViewer.selectDocument')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-screen Preview Modal */}
            <PDFPreviewModal
                isOpen={showPreviewModal && selectedDoc !== null}
                onClose={() => setShowPreviewModal(false)}
                fileUrl={fileUrl}
                fileName={selectedDoc?.file_name || ''}
                fileType={selectedDoc ? t(`staff.documentViewer.docTypes.${selectedDoc.attachment_type}`) : undefined}
                isLoading={loadingFile}
                error={fileError}
            />
        </div>
    );
}
