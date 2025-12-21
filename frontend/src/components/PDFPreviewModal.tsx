import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PDFViewer from './PDFViewer';
import { downloadFile } from '@/utils/fileDownload';

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string | null;
    fileName: string;
    fileType?: string;
    isLoading?: boolean;
    error?: string | null;
}

export default function PDFPreviewModal({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
    isLoading = false,
    error = null,
}: PDFPreviewModalProps) {
    const { t } = useTranslation();

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleDownload = async () => {
        if (fileUrl) {
            await downloadFile(fileUrl, fileName);
        }
    };

    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-600">
                            {isPdf ? 'picture_as_pdf' : isImage ? 'image' : 'description'}
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate max-w-md">
                                {fileName}
                            </h3>
                            {fileType && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {fileType}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={!fileUrl || isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span className="hidden sm:inline text-sm font-medium">
                                {t('common.download')}
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title={t('common.close')}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-hidden p-4">
                    {isLoading ? (
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
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8">
                                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                                    error
                                </span>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={handleDownload}
                                    disabled={!fileUrl}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">download</span>
                                    <span className="text-sm font-medium">
                                        {t('common.download')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    ) : fileUrl && isPdf ? (
                        <PDFViewer
                            fileUrl={fileUrl}
                            fileName={fileName}
                            onDownload={handleDownload}
                        />
                    ) : fileUrl && isImage ? (
                        <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg">
                            <img
                                src={fileUrl}
                                alt={fileName}
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
                                    onClick={handleDownload}
                                    disabled={!fileUrl}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
    );
}
