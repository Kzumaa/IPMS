import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { completeSubstantiveExamination } from '../store/staffSlice';
import type { Application } from '@/features/application/types/applicationTypes';

interface ContentCheckPanelProps {
    application: Application;
    onSuccess?: () => void;
}

interface CriteriaItem {
    id: string;
    label: string;
    description: string;
    score: number; // 0: not assessed, 1: fail, 2: concern, 3: pass
}

export default function ContentCheckPanel({ application, onSuccess }: ContentCheckPanelProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { examinationLoading, examinationError } = useAppSelector((state) => state.staff);

    const [result, setResult] = useState<'ACCEPTABLE' | 'OBJECTION' | 'REJECTED'>('ACCEPTABLE');
    const [notes, setNotes] = useState('');
    const [criteria, setCriteria] = useState<CriteriaItem[]>(() => {
        const items: CriteriaItem[] = [];

        // Patent and Utility Solution criteria
        if (application.app_type === 'PATENT' || application.app_type === 'UTILITY') {
            items.push({
                id: 'novelty',
                label: t('staff.contentCheck.novelty'),
                description: t('staff.contentCheck.noveltyDesc'),
                score: 0,
            });

            if (application.app_type === 'PATENT') {
                items.push({
                    id: 'inventive_step',
                    label: t('staff.contentCheck.inventiveStep'),
                    description: t('staff.contentCheck.inventiveStepDesc'),
                    score: 0,
                });
            }

            items.push({
                id: 'industrial_applicability',
                label: t('staff.contentCheck.industrialApplicability'),
                description: t('staff.contentCheck.industrialApplicabilityDesc'),
                score: 0,
            });

            items.push({
                id: 'sufficient_disclosure',
                label: t('staff.contentCheck.sufficientDisclosure'),
                description: t('staff.contentCheck.sufficientDisclosureDesc'),
                score: 0,
            });

            items.push({
                id: 'claims_supported',
                label: t('staff.contentCheck.claimsSupported'),
                description: t('staff.contentCheck.claimsSupportedDesc'),
                score: 0,
            });

            items.push({
                id: 'unity_invention',
                label: t('staff.contentCheck.unityInvention'),
                description: t('staff.contentCheck.unityInventionDesc'),
                score: 0,
            });
        }

        // Design criteria
        if (application.app_type === 'INDUSTRIAL_DESIGN') {
            items.push({
                id: 'design_novelty',
                label: t('staff.contentCheck.designNovelty'),
                description: t('staff.contentCheck.designNoveltyDesc'),
                score: 0,
            });

            items.push({
                id: 'design_originality',
                label: t('staff.contentCheck.designOriginality'),
                description: t('staff.contentCheck.designOriginalityDesc'),
                score: 0,
            });

            items.push({
                id: 'design_clarity',
                label: t('staff.contentCheck.designClarity'),
                description: t('staff.contentCheck.designClarityDesc'),
                score: 0,
            });
        }

        return items;
    });

    const handleCriteriaChange = (id: string, score: number) => {
        setCriteria(prev => prev.map(item =>
            item.id === id ? { ...item, score } : item
        ));
    };

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

    const getScoreColor = (score: number) => {
        switch (score) {
            case 3: return 'text-green-600 dark:text-green-400';
            case 2: return 'text-yellow-600 dark:text-yellow-400';
            case 1: return 'text-red-600 dark:text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getScoreIcon = (score: number) => {
        switch (score) {
            case 3: return 'check_circle';
            case 2: return 'warning';
            case 1: return 'cancel';
            default: return 'radio_button_unchecked';
        }
    };

    const allAssessed = criteria.every(item => item.score > 0);
    const hasFailures = criteria.some(item => item.score === 1);
    const hasConcerns = criteria.some(item => item.score === 2);

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

            {/* Examination Criteria */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {t('staff.contentCheck.examinationCriteria')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('staff.contentCheck.assessEachCriteria')}
                </p>

                <div className="space-y-4">
                    {criteria.map((item) => (
                        <div
                            key={item.id}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {item.label}
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {item.description}
                                    </p>
                                </div>
                                <span className={`material-symbols-outlined text-2xl ml-4 ${getScoreColor(item.score)}`}>
                                    {getScoreIcon(item.score)}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCriteriaChange(item.id, 3)}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                        item.score === 3
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300'
                                    }`}
                                >
                                    {t('staff.contentCheck.pass')}
                                </button>
                                <button
                                    onClick={() => handleCriteriaChange(item.id, 2)}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                        item.score === 2
                                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-yellow-300'
                                    }`}
                                >
                                    {t('staff.contentCheck.concern')}
                                </button>
                                <button
                                    onClick={() => handleCriteriaChange(item.id, 1)}
                                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                        item.score === 1
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300'
                                    }`}
                                >
                                    {t('staff.contentCheck.fail')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assessment Summary */}
            {allAssessed && (
                <div className={`rounded-lg p-4 mb-6 ${
                    hasFailures
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        : hasConcerns
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined ${
                            hasFailures ? 'text-red-600' : hasConcerns ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {hasFailures ? 'error' : hasConcerns ? 'warning' : 'check_circle'}
                        </span>
                        <h4 className={`font-semibold ${
                            hasFailures ? 'text-red-800 dark:text-red-200' :
                            hasConcerns ? 'text-yellow-800 dark:text-yellow-200' :
                            'text-green-800 dark:text-green-200'
                        }`}>
                            {t('staff.contentCheck.assessmentSummary')}
                        </h4>
                    </div>
                    <p className={`text-sm ${
                        hasFailures ? 'text-red-700 dark:text-red-300' :
                        hasConcerns ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-green-700 dark:text-green-300'
                    }`}>
                        {hasFailures
                            ? t('staff.contentCheck.hasFailures')
                            : hasConcerns
                            ? t('staff.contentCheck.hasConcerns')
                            : t('staff.contentCheck.allPass')
                        }
                    </p>
                </div>
            )}

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
                disabled={examinationLoading || !allAssessed || ((result === 'OBJECTION' || result === 'REJECTED') && !notes.trim())}
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
