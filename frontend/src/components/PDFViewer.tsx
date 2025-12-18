import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PDFViewerProps {
    fileUrl: string;
    fileName: string;
    onDownload?: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onDownload }: PDFViewerProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-indigo-600 animate-spin mb-4">
                            refresh
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                            {t('common.loading')}
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                    <div className="text-center p-8">
                        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                            error
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {t('pdfViewer.loadError')}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {t('pdfViewer.loadErrorDesc')}
                        </p>
                        {onDownload && (
                            <button
                                onClick={onDownload}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">download</span>
                                {t('pdfViewer.downloadInstead')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* PDF Viewer Controls */}
            {!error && (
                <div className="absolute top-0 left-0 right-0 bg-slate-800 text-white p-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                        <span className="text-sm font-medium truncate max-w-[300px]">
                            {fileName}
                        </span>
                    </div>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm"
                            title={t('pdfViewer.download')}
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span className="hidden sm:inline">{t('pdfViewer.download')}</span>
                        </button>
                    )}
                </div>
            )}

            {/* PDF Embed */}
            {!error && (
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full h-full border-0"
                    style={{ marginTop: '40px', height: 'calc(100% - 40px)' }}
                    title={fileName}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Fallback for browsers that don't support iframe PDF viewing */}
            <noscript>
                <div className="p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {t('pdfViewer.noJavaScript')}
                    </p>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                        >
                            <span className="material-symbols-outlined">download</span>
                            {t('pdfViewer.download')}
                        </button>
                    )}
                </div>
            </noscript>
        </div>
    );
}
