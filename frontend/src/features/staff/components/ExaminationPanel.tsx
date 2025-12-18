import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { issueDecision } from '../store/staffSlice';
import FormCheckPanel from './FormCheckPanel';
import ContentCheckPanel from './ContentCheckPanel';
import type { Application, ApplicationParty, ApplicationAttachment } from '@/features/application/types/applicationTypes';

interface ExaminationPanelProps {
    application: Application;
    parties: ApplicationParty[];
    attachments: ApplicationAttachment[];
    onSuccess?: () => void;
}

export default function ExaminationPanel({ application, parties, attachments, onSuccess }: ExaminationPanelProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { examinationLoading, examinationError } = useAppSelector((state) => state.staff);

    const [decisionType, setDecisionType] = useState<'GRANT' | 'REFUSE'>('GRANT');
    const [notes, setNotes] = useState('');

    const handleDecision = async () => {
        const result = await dispatch(
            issueDecision({
                applicationId: application.id!,
                data: { type: decisionType, notes: notes || undefined },
            })
        );

        if (issueDecision.fulfilled.match(result)) {
            setNotes('');
            onSuccess?.();
        }
    };

    // Determine which examination panel to show based on status
    // Formality examination happens when application is SUBMITTED
    const showFormalityExam = application.status === 'SUBMITTED';
    // Substantive examination happens after application is PUBLISHED
    const showSubstantiveExam = application.status === 'PUBLISHED';
    // Decision can be issued when in SUB_EXAM_REQ or WAITING_RESPONSE
    const showDecision = application.status === 'SUB_EXAM_REQ' || application.status === 'WAITING_RESPONSE';

    if (!showFormalityExam && !showSubstantiveExam && !showDecision) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400">{t('staff.examination.noActions')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Formality Examination */}
            {showFormalityExam && (
                <FormCheckPanel
                    application={application}
                    parties={parties}
                    attachments={attachments}
                    onSuccess={onSuccess}
                />
            )}

            {/* Substantive Examination */}
            {showSubstantiveExam && (
                <ContentCheckPanel
                    application={application}
                    onSuccess={onSuccess}
                />
            )}

            {/* Decision */}
            {showDecision && (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-2xl text-green-600">gavel</span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('staff.examination.issueDecision')}
                        </h2>
                    </div>

                    {examinationError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                            <p className="text-red-800 dark:text-red-200">{examinationError}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            {t('staff.examination.decision')}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDecisionType('GRANT')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    decisionType === 'GRANT'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-green-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {t('staff.examination.grant')}
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => setDecisionType('REFUSE')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    decisionType === 'REFUSE'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-red-600">cancel</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {t('staff.examination.refuse')}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('staff.examination.notes')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-900 dark:text-white"
                            placeholder={t('staff.examination.notesPlaceholder')}
                        />
                    </div>

                    <button
                        onClick={handleDecision}
                        disabled={examinationLoading}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {examinationLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">refresh</span>
                                {t('staff.examination.submitting')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">send</span>
                                {t('staff.examination.issueDecisionButton')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
