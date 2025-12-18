import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PDFViewer from '@/components/PDFViewer';
import axiosClient from '@/api/axiosClient';
import type { ApplicationAttachment } from '../types/applicationTypes';

interface ApplicantDocumentViewerProps {
    attachments: ApplicationAttachment[];
    applicationId: number;
}

export default function ApplicantDocumentViewer({ attachments, applicationId }: ApplicantDocumentViewerProps) {
    const { t } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState<ApplicationAttachment | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [showViewer, setShowViewer] = useState(false);

    // Fetch file URL when selected document changes
    useEffect(() => {
        const fetchFileUrl = async () => {
            if (!selectedDoc) {
                setFileUrl(null);
                return;
            }

            setLoadingFile(true);
            setFileError(null);

            try {
                const response = await axiosClient.get(
                    `/applications/${applicationId}/attachments/${selectedDoc.id}/download`
                );
                setFileUrl(response.data.data.url);
            } catch (error) {
                console.error('Failed to fetch file URL:', error);
                setFileError('Failed to load file. Please try again.');
            } finally {
                setLoadingFile(false);
            }
        };

        fetchFileUrl();
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

    const handleViewDocument = (attachment: ApplicationAttachment) => {
        setSelectedDoc(attachment);
        setShowViewer(true);
    };

    const handleDownload = async (attachment: ApplicationAttachment) => {
        try {
            const response = await axiosClient.get(
                `/applications/${applicationId}/attachments/${attachment.id}/download`
            );
            const downloadUrl = response.data.data.url;

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = response.data.data.filename || attachment.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
        setSelectedDoc(null);
        setFileUrl(null);
    };

    if (attachments.length === 0) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('application.detail.noAttachments')}
            </p>
        );
    }

    return (
        <>
            {/* Document List */}
            <ul className="space-y-2">
                {attachments.map((attachment) => (
                    <li
                        key={attachment.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded"
                    >
                        <span className="material-symbols-outlined text-slate-500 !text-lg">
                            {getDocTypeIcon(attachment.attachment_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-white truncate">
                                {attachment.file_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t(`application.attachmentTypes.${attachment.attachment_type}`)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleViewDocument(attachment)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                title={t('common.view')}
                            >
                                <span className="material-symbols-outlined !text-lg">visibility</span>
                            </button>
                            <button
                                onClick={() => handleDownload(attachment)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors"
                                title={t('common.download')}
                            >
                                <span className="material-symbols-outlined !text-lg">download</span>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Document Viewer Modal */}
            {showViewer && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-indigo-600">
                                    {getDocTypeIcon(selectedDoc.attachment_type)}
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {selectedDoc.file_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {t(`application.attachmentTypes.${selectedDoc.attachment_type}`)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(selectedDoc)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    <span className="hidden sm:inline text-sm font-medium">
                                        {t('common.download')}
                                    </span>
                                </button>
                                <button
                                    onClick={handleCloseViewer}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    title={t('common.close')}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-hidden p-4">
                            {loadingFile ? (
                                <div className="flex items-center justify-center h-full">
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
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8">
                                        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                                            error
                                        </span>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            {fileError}
                                        </p>
                                        <button
                                            onClick={() => handleDownload(selectedDoc)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            <span className="text-sm font-medium">
                                                {t('common.download')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ) : fileUrl && selectedDoc.file_name.toLowerCase().endsWith('.pdf') ? (
                                <PDFViewer
                                    fileUrl={fileUrl}
                                    fileName={selectedDoc.file_name}
                                    onDownload={() => handleDownload(selectedDoc)}
                                />
                            ) : fileUrl && selectedDoc.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg">
                                    <img
                                        src={fileUrl}
                                        alt={selectedDoc.file_name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                                            description
                                        </span>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            {t('pdfViewer.previewNotAvailable')}
                                        </p>
                                        <button
                                            onClick={() => handleDownload(selectedDoc)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            <span className="text-sm font-medium">
                                                {t('common.download')}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
