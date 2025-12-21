import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

export default function PDFViewer({ fileUrl, onDownload }: PDFViewerProps) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  // Create the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]], // Only show thumbnails tab
  });

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
            error
          </span>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t("pdfViewer.loadError")}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t("pdfViewer.loadErrorDesc")}
          </p>
          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined">download</span>
              {t("pdfViewer.downloadInstead")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-full" style={{ minHeight: "600px" }}>
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance]}
            onDocumentLoad={() => setError(false)}
            renderError={() => {
              setError(true);
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                      error
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {t("pdfViewer.loadErrorDesc")}
                    </p>
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          download
                        </span>
                        {t("pdfViewer.downloadInstead")}
                      </button>
                    )}
                  </div>
                </div>
              );
            }}
            renderLoader={(percentages) => (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-indigo-600 animate-spin mb-4">
                    refresh
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t("common.loading")} {Math.round(percentages)}%
                  </p>
                </div>
              </div>
            )}
          />
        </div>
      </Worker>
    </div>
  );
}
