import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import type { Application } from '../types/applicationTypes';
import { AppTypeLabels } from '../types/enums';

interface SplitApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newApplication: Application) => void;
}

const SplitApplicationModal: React.FC<SplitApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(`${application.title} - Split`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await applicationService.splitApplication(application.id, {
        title: title.trim() || undefined,
      });

      onSuccess?.(response.data);
      onClose();

      // Navigate to the new application
      navigate(`/applications/${response.data.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : t('split.error', 'Failed to split application');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform rounded-lg bg-white dark:bg-slate-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('split.title', 'Split Application')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Original application info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('split.originalApplication', 'Original Application')}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{t('application.filingNumber', 'Filing Number')}:</span>{' '}
                    {application.filing_number || '-'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{t('application.type', 'Type')}:</span>{' '}
                    {AppTypeLabels[application.app_type]}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{t('application.title', 'Title')}:</span>{' '}
                    {application.title}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 !text-lg mt-0.5">
                    info
                  </span>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t(
                      'split.description',
                      'Creating a split application will create a new DRAFT application based on this one. The new application will inherit parties and priority claims from the original.'
                    )}
                  </p>
                </div>
              </div>

              {/* New title input */}
              <div>
                <label
                  htmlFor="split-title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('split.newTitle', 'New Application Title')}
                </label>
                <input
                  type="text"
                  id="split-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder={t('split.titlePlaceholder', 'Enter title for the new application')}
                  required
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 !text-lg">
                      error
                    </span>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin !text-base">
                      refresh
                    </span>
                    {t('common.processing', 'Processing...')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-base">call_split</span>
                    {t('split.createSplit', 'Create Split Application')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SplitApplicationModal;
