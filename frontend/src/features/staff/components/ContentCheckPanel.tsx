import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeSubstantiveExamination } from '../store/staffSlice';
import type { Application } from '@/features/application/types/applicationTypes';

interface ContentCheckPanelProps {
    application: Application;
    onSuccess?: () => void;
}

export default function ContentCheckPanel({ application, onSuccess }: ContentCheckPanelProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { examinationLoading, examinationError } = useAppSelector((state) => state.staff);

    const [result, setResult] = useState<'ACCEPTABLE' | 'OBJECTION' | 'REJECTED'>('ACCEPTABLE');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        const submitResult = await dispatch(
            completeSubstantiveExamination({
                applicationId: application.id!,
                data: { result, notes: notes || undefined },
            })
        );

        if (completeSubstantiveExamination.fulfilled.match(submitResult)) {
            setNotes('');
            onSuccess?.();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-purple-600">psychology</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('staff.contentCheck.title')}
                </h2>
            </div>

            {examinationError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200">{examinationError}</p>
                </div>
            )}

            {/* Application Info Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t('staff.contentCheck.applicationInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('application.table.appType')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {t(`application.appTypes.${application.app_type}`)}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('application.detail.filingDate')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {application.filing_date ? new Date(application.filing_date).toLocaleDateString() : '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('staff.contentCheck.publicationDate')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {application.pct_publication_date ? new Date(application.pct_publication_date).toLocaleDateString() : '-'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('staff.contentCheck.publicationNumber')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {application.pct_number || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Result Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t('staff.examination.result')}
                </label>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setResult('ACCEPTABLE')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            result === 'ACCEPTABLE'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                {t('staff.examination.acceptable')}
                            </span>
                        </div>
                    </button>
                    <button
                        onClick={() => setResult('OBJECTION')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            result === 'OBJECTION'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-600">warning</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                {t('staff.examination.objection')}
                            </span>
                        </div>
                    </button>
                    <button
                        onClick={() => setResult('REJECTED')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            result === 'REJECTED'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-red-600">cancel</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                {t('staff.examination.rejected')}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('staff.examination.notes')}
                    {(result === 'OBJECTION' || result === 'REJECTED') && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                            {t('staff.contentCheck.requiredForNonAcceptable')}
                        </span>
                    )}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white font-mono text-sm"
                    placeholder={t('staff.contentCheck.notesPlaceholder')}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {result === 'OBJECTION'
                        ? t('staff.contentCheck.objectionGuidance')
                        : result === 'REJECTED'
                        ? t('staff.contentCheck.rejectionGuidance')
                        : t('staff.contentCheck.acceptableGuidance')
                    }
                </p>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={examinationLoading || ((result === 'OBJECTION' || result === 'REJECTED') && !notes.trim())}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
            >
                {examinationLoading ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        {t('staff.examination.submitting')}
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">send</span>
                        {t('staff.examination.completeSubstantiveExamination')}
                    </>
                )}
            </button>
        </div>
    );
}
