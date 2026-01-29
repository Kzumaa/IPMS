import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeFormalityExamination } from '../store/staffSlice';
import type { Application, ApplicationParty, ApplicationAttachment } from '@/features/application/types/applicationTypes';

interface FormCheckPanelProps {
    application: Application;
    parties: ApplicationParty[];
    attachments: ApplicationAttachment[];
    onSuccess?: () => void;
}

export default function FormCheckPanel({ application, parties, attachments, onSuccess }: FormCheckPanelProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { examinationLoading, examinationError } = useAppSelector((state) => state.staff);

    const [result, setResult] = useState<'PASS' | 'FAIL'>('PASS');
    const [notes, setNotes] = useState('');

    const handleSubmit = async () => {
        const submitResult = await dispatch(
            completeFormalityExamination({
                applicationId: application.id!,
                data: { result, notes: notes || undefined },
            })
        );

        if (completeFormalityExamination.fulfilled.match(submitResult)) {
            setNotes('');
            onSuccess?.();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-blue-600">fact_check</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('staff.formCheck.title')}
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
                    {t('staff.formCheck.applicationInfo')}
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
                    <div className="col-span-2">
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('staff.formCheck.parties')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {parties.length} {t('staff.formCheck.partiesCount')}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-slate-500 dark:text-slate-400">
                            {t('staff.formCheck.attachments')}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {attachments.length} {t('staff.formCheck.documentsCount')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Result Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('staff.examination.result')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setResult('PASS')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            result === 'PASS'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {t('staff.examination.pass')}
                            </span>
                        </div>
                    </button>
                    <button
                        onClick={() => setResult('FAIL')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            result === 'FAIL'
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-red-600">cancel</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {t('staff.examination.fail')}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('staff.examination.notes')}
                    {result === 'FAIL' && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                            {t('staff.formCheck.requiredForFail')}
                        </span>
                    )}
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
                    placeholder={t('staff.examination.notesPlaceholder')}
                />
                {result === 'FAIL' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {t('staff.formCheck.failNotesGuidance')}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={examinationLoading || (result === 'FAIL' && !notes.trim())}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
            >
                {examinationLoading ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        {t('staff.examination.submitting')}
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">send</span>
                        {t('staff.examination.completeFormalityExamination')}
                    </>
                )}
            </button>
        </div>
    );
}
