import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import staffService, {
    type ClassificationSummary,
    type ClassificationAssignRequest,
    type IpcClassInfo,
    type LocarnoClassInfo
} from '../services/staffService';

interface ClassificationAssignmentModalProps {
    applicationId: number;
    appType: 'PATENT' | 'UTILITY' | 'INDUSTRIAL_DESIGN';
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ClassificationAssignmentModal: React.FC<ClassificationAssignmentModalProps> = ({
    applicationId,
    appType,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classification, setClassification] = useState<ClassificationSummary | null>(null);

    // IPC class form state (for Patent/Utility)
    const [ipcClasses, setIpcClasses] = useState<IpcClassInfo[]>([]);
    const [newIpc, setNewIpc] = useState<IpcClassInfo>({
        section: '',
        class_code: '',
        subclass: '',
        group: '',
        subgroup: '',
        label: '',
    });

    // Locarno class form state (for Industrial Design)
    const [locarnoClasses, setLocarnoClasses] = useState<LocarnoClassInfo[]>([]);
    const [newLocarno, setNewLocarno] = useState<LocarnoClassInfo>({
        class_code: '',
        subclass: '',
        label: '',
    });

    const isDesign = appType === 'INDUSTRIAL_DESIGN';

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchClassification();
        }
    }, [isOpen, applicationId]);

    const fetchClassification = async () => {
        try {
            setFetchLoading(true);
            setError(null);
            const response = await staffService.getClassificationSummary(applicationId);
            setClassification(response.data);
            // Initialize with existing classes
            if (response.data.ipc_classes) {
                setIpcClasses(response.data.ipc_classes);
            }
            if (response.data.locarno_classes) {
                setLocarnoClasses(response.data.locarno_classes);
            }
        } catch (err) {
            console.error('Failed to fetch classification:', err);
            setError(t('staff.classification.loadError', 'Failed to load classification data'));
        } finally {
            setFetchLoading(false);
        }
    };

    const handleAddIpc = () => {
        if (!newIpc.section || !newIpc.class_code) {
            return;
        }
        setIpcClasses([...ipcClasses, { ...newIpc }]);
        setNewIpc({
            section: '',
            class_code: '',
            subclass: '',
            group: '',
            subgroup: '',
            label: '',
        });
    };

    const handleRemoveIpc = (index: number) => {
        setIpcClasses(ipcClasses.filter((_, i) => i !== index));
    };

    const handleAddLocarno = () => {
        if (!newLocarno.class_code) {
            return;
        }
        setLocarnoClasses([...locarnoClasses, { ...newLocarno }]);
        setNewLocarno({
            class_code: '',
            subclass: '',
            label: '',
        });
    };

    const handleRemoveLocarno = (index: number) => {
        setLocarnoClasses(locarnoClasses.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const data: ClassificationAssignRequest = {};

            if (!isDesign) {
                data.ipc_classes = ipcClasses.map(ipc => ({
                    section: ipc.section,
                    class_code: ipc.class_code,
                    subclass: ipc.subclass || undefined,
                    group: ipc.group || undefined,
                    subgroup: ipc.subgroup || undefined,
                    label: ipc.label || undefined,
                }));
            } else {
                data.locarno_classes = locarnoClasses.map(loc => ({
                    class_code: loc.class_code,
                    subclass: loc.subclass || undefined,
                    label: loc.label || undefined,
                }));
            }

            await staffService.assignClassification(applicationId, data);
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : t('staff.classification.assignError', 'Failed to assign classification');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const hasClasses = isDesign ? locarnoClasses.length > 0 : ipcClasses.length > 0;

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
                <div className="relative w-full max-w-2xl transform rounded-lg bg-white dark:bg-slate-800 shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t('staff.classification.title', 'Assign Classification')}
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
                    <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                        {fetchLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
                                    refresh
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">
                                    {t('common.loading')}
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Info box */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 !text-lg mt-0.5">
                                            info
                                        </span>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            {isDesign
                                                ? t('staff.classification.locarnoInfo', 'Assign Locarno classification codes for this industrial design application.')
                                                : t('staff.classification.ipcInfo', 'Assign IPC (International Patent Classification) codes for this patent/utility application.')}
                                        </p>
                                    </div>
                                </div>

                                {/* Existing classes */}
                                {classification && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {t('staff.classification.currentClasses', 'Current Classification')}
                                        </h4>
                                        {!isDesign && classification.ipc_classes.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {classification.ipc_classes.map((ipc, index) => (
                                                    <span
                                                        key={index}
                                                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                                                            ipc.assigned_by_type === 'STAFF'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {ipc.section}{ipc.class_code}
                                                        {ipc.subclass && `.${ipc.subclass}`}
                                                        {ipc.group && `/${ipc.group}`}
                                                        {ipc.subgroup && `:${ipc.subgroup}`}
                                                        {ipc.assigned_by_type === 'STAFF' && (
                                                            <span className="ml-1 text-purple-500">(Staff)</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : isDesign && classification.locarno_classes.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {classification.locarno_classes.map((loc, index) => (
                                                    <span
                                                        key={index}
                                                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                                                            loc.assigned_by_type === 'STAFF'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {loc.class_code}
                                                        {loc.subclass && `-${loc.subclass}`}
                                                        {loc.assigned_by_type === 'STAFF' && (
                                                            <span className="ml-1 text-purple-500">(Staff)</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {t('staff.classification.noClasses', 'No classification assigned yet')}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Add new classes */}
                                <div>
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        {t('staff.classification.addNew', 'Add Classification')}
                                    </h4>

                                    {!isDesign ? (
                                        // IPC Form
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-6 gap-2">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.section', 'Section')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newIpc.section}
                                                        onChange={(e) => setNewIpc({ ...newIpc, section: e.target.value.toUpperCase() })}
                                                        maxLength={1}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="A"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.classCode', 'Class')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newIpc.class_code}
                                                        onChange={(e) => setNewIpc({ ...newIpc, class_code: e.target.value })}
                                                        maxLength={2}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.subclass', 'Subclass')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newIpc.subclass || ''}
                                                        onChange={(e) => setNewIpc({ ...newIpc, subclass: e.target.value.toUpperCase() })}
                                                        maxLength={1}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="B"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.group', 'Group')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newIpc.group || ''}
                                                        onChange={(e) => setNewIpc({ ...newIpc, group: e.target.value })}
                                                        maxLength={4}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.subgroup', 'Subgroup')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newIpc.subgroup || ''}
                                                        onChange={(e) => setNewIpc({ ...newIpc, subgroup: e.target.value })}
                                                        maxLength={6}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="00"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddIpc}
                                                        disabled={!newIpc.section || !newIpc.class_code}
                                                        className="w-full px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="material-symbols-outlined !text-base">add</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Added IPC classes */}
                                            {ipcClasses.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                        {t('staff.classification.classesToAdd', 'Classes to add:')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ipcClasses.map((ipc, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                                            >
                                                                {ipc.section}{ipc.class_code}
                                                                {ipc.subclass && `.${ipc.subclass}`}
                                                                {ipc.group && `/${ipc.group}`}
                                                                {ipc.subgroup && `:${ipc.subgroup}`}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveIpc(index)}
                                                                    className="text-indigo-500 hover:text-indigo-700"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">close</span>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Locarno Form
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-4 gap-2">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.classCode', 'Class')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newLocarno.class_code}
                                                        onChange={(e) => setNewLocarno({ ...newLocarno, class_code: e.target.value })}
                                                        maxLength={2}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.subclass', 'Subclass')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newLocarno.subclass || ''}
                                                        onChange={(e) => setNewLocarno({ ...newLocarno, subclass: e.target.value })}
                                                        maxLength={2}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {t('staff.classification.label', 'Label')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newLocarno.label || ''}
                                                        onChange={(e) => setNewLocarno({ ...newLocarno, label: e.target.value })}
                                                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                                                        placeholder="Description"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLocarno}
                                                        disabled={!newLocarno.class_code}
                                                        className="w-full px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="material-symbols-outlined !text-base">add</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Added Locarno classes */}
                                            {locarnoClasses.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                        {t('staff.classification.classesToAdd', 'Classes to add:')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {locarnoClasses.map((loc, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                                            >
                                                                {loc.class_code}
                                                                {loc.subclass && `-${loc.subclass}`}
                                                                {loc.label && ` (${loc.label})`}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveLocarno(index)}
                                                                    className="text-indigo-500 hover:text-indigo-700"
                                                                >
                                                                    <span className="material-symbols-outlined !text-sm">close</span>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !hasClasses}
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
                                    <span className="material-symbols-outlined !text-base">check</span>
                                    {t('staff.classification.assign', 'Assign Classification')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassificationAssignmentModal;
