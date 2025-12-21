import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import axiosClient from '@/api/axiosClient';
import { downloadFile } from '@/utils/fileDownload';
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

        if (showViewer && selectedDoc) {
            fetchFileUrl();
        }

        // Cleanup function to revoke object URL
        return () => {
            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [selectedDoc, applicationId, showViewer]);

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
            const filename = response.data.data.filename || attachment.file_name;

            // Use the proper download utility
            await downloadFile(downloadUrl, filename);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
        setSelectedDoc(null);
        setFileUrl(null);
        setFileError(null);
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
            <PDFPreviewModal
                isOpen={showViewer && selectedDoc !== null}
                onClose={handleCloseViewer}
                fileUrl={fileUrl}
                fileName={selectedDoc?.file_name || ''}
                fileType={selectedDoc ? t(`application.attachmentTypes.${selectedDoc.attachment_type}`) : undefined}
                isLoading={loadingFile}
                error={fileError}
            />
        </>
    );
}
