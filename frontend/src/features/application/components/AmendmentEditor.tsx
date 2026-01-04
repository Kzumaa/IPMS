import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApplicationSnapshot, ProposedAmendmentData, SnapshotParty, NewAttachment } from '../types/applicationTypes';
import { useAmendmentTracking } from '../hooks/useAmendmentTracking';
import { PartyType, AttachmentType } from '../types/enums';

// Map doc_type to display label
const docTypeLabels: Record<string, string> = {
    'DESCRIPTION': 'Description',
    'CLAIMS': 'Claims',
    'ABSTRACT': 'Abstract',
    'DRAWINGS': 'Drawings',
    'PRIORITY_DOC': 'Priority Document',
    'POA': 'Power of Attorney',
    'ASSIGNMENT': 'Assignment Document',
    'DECLARATION': 'Declaration',
    'SEQUENCE': 'Sequence Listing',
    'ID_PHOTOS': 'ID Photos',
    'OTHER': 'Other',
};

interface AmendmentEditorProps {
    applicationId: number;
    originalData: ApplicationSnapshot;
    readonlyFields: string[];
    onSubmit: (
        proposedData: ProposedAmendmentData,
        changeSummary: string,
        newAttachments: NewAttachment[],
        removedAttachmentIds: number[]
    ) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const AmendmentEditor: React.FC<AmendmentEditorProps> = ({
    applicationId: _applicationId,
    originalData,
    readonlyFields: _readonlyFields,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const { t } = useTranslation();
    const {
        proposedData,
        changedFields,
        setFieldValue,
        hasChanges,
        changesCount,
        getChangeSummary,
        resetChanges,
    } = useAmendmentTracking(originalData);

    const [changeSummary, setChangeSummary] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Attachment handling - declare state before using in hasAnyChanges
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newAttachments, setNewAttachments] = useState<Array<{ file: File; doc_type: string }>>([]);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<number>>(new Set());
    const [selectedDocType, setSelectedDocType] = useState<string>(AttachmentType.DESCRIPTION);

    const isChanged = (fieldPath: string) => changedFields.has(fieldPath);

    // Check if there are any changes including attachment changes
    const hasAnyChanges = hasChanges || newAttachments.length > 0 || removedAttachmentIds.size > 0;

    const handleSubmit = () => {
        if (!hasAnyChanges || !changeSummary.trim()) return;
        setShowConfirmation(true);
    };

    const confirmSubmit = () => {
        onSubmit(proposedData, changeSummary, newAttachments, Array.from(removedAttachmentIds));
        setShowConfirmation(false);
    };

    const handleAddParty = () => {
        const newParty: SnapshotParty = {
            role: PartyType.APPLICANT,
            snapshot_name: '',
            snapshot_email: '',
            snapshot_address: '',
            is_primary: false,
        };
        setFieldValue('parties', [...(proposedData.parties || []), newParty]);
    };

    const handleUpdateParty = (index: number, field: keyof SnapshotParty, value: unknown) => {
        const parties = [...(proposedData.parties || [])];
        parties[index] = { ...parties[index], [field]: value };
        setFieldValue('parties', parties);
    };

    const handleRemoveParty = (index: number) => {
        const parties = [...(proposedData.parties || [])];
        parties.splice(index, 1);
        setFieldValue('parties', parties);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setNewAttachments(prev => [...prev, { file, doc_type: selectedDocType }]);

        // Mark attachments as changed
        setFieldValue('attachments', [...(proposedData.attachments || [])]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveNewAttachment = (index: number) => {
        setNewAttachments(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
        // Trigger change tracking
        setFieldValue('attachments', [...(proposedData.attachments || [])]);
    };

    const handleRemoveExistingAttachment = (attachmentId: number) => {
        setRemovedAttachmentIds(prev => {
            const next = new Set(prev);
            next.add(attachmentId);
            return next;
        });
        // Update proposedData to remove this attachment
        const updatedAttachments = (proposedData.attachments || []).filter(a => a.id !== attachmentId);
        setFieldValue('attachments', updatedAttachments);
    };

    const handleRestoreAttachment = (attachmentId: number) => {
        setRemovedAttachmentIds(prev => {
            const next = new Set(prev);
            next.delete(attachmentId);
            return next;
        });
        // Restore the attachment from original data
        const originalAttachment = originalData.attachments?.find(a => a.id === attachmentId);
        if (originalAttachment) {
            const updatedAttachments = [...(proposedData.attachments || []), {
                id: originalAttachment.id,
                doc_type: originalAttachment.doc_type,
                original_filename: originalAttachment.original_filename,
                page_count: originalAttachment.page_count,
            }];
            setFieldValue('attachments', updatedAttachments);
        }
    };

    // Check if attachments have changed
    const attachmentsChanged = isChanged('attachments') || newAttachments.length > 0 || removedAttachmentIds.size > 0;

    return (
        <div className="space-y-6">
            {/* Header with change indicator */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mr-2 mt-0.5">edit_note</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            {t('amendment.editMode.title', 'Amendment Edit Mode')}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            {t('amendment.editMode.description', 'Make changes to the application below. Changed fields will be highlighted. After submission, a staff member will review and approve or reject your changes.')}
                        </p>
                        {hasAnyChanges && (
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mt-2">
                                {t('amendment.editMode.changesCount', '{{count}} field(s) modified', {
                                    count: changesCount + (newAttachments.length > 0 ? 1 : 0) + (removedAttachmentIds.size > 0 ? 1 : 0)
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.basicInfo.sectionTitle', 'Basic Information')}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {/* Application Type - Always Readonly */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.steps.basicInfo.appType', 'Application Type')}
                            <span className="ml-2 text-xs text-slate-500">{t('common.readonly', '(readonly)')}</span>
                        </label>
                        <input
                            type="text"
                            value={originalData.app_type}
                            disabled
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Title - Editable */}
                    <div className={isChanged('title') ? 'ring-2 ring-amber-400 rounded-md p-2 -m-2' : ''}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.steps.basicInfo.inventionTitle', 'Title')}
                            {isChanged('title') && (
                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                    {t('common.modified', '(modified)')}
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={proposedData.title || ''}
                            onChange={(e) => setFieldValue('title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Parties Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('application.steps.parties.title', 'Parties')}
                        {isChanged('parties') && (
                            <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                                {t('common.modified', '(modified)')}
                            </span>
                        )}
                    </h3>
                    <button
                        type="button"
                        onClick={handleAddParty}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md"
                    >
                        <span className="material-symbols-outlined mr-1 text-lg">add</span>
                        {t('application.steps.parties.addParty', 'Add Party')}
                    </button>
                </div>

                <div className="space-y-4">
                    {proposedData.parties?.map((party, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('application.steps.parties.partyNumber', 'Party #{{number}}', { number: index + 1 })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveParty(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.parties.role', 'Role')}
                                    </label>
                                    <select
                                        value={party.role}
                                        onChange={(e) => handleUpdateParty(index, 'role', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value={PartyType.APPLICANT}>{t('application.partyTypes.APPLICANT', 'Applicant')}</option>
                                        <option value={PartyType.INVENTOR}>{t('application.partyTypes.INVENTOR', 'Inventor')}</option>
                                        <option value={PartyType.REPRESENTATIVE}>{t('application.partyTypes.REPRESENTATIVE', 'Representative')}</option>
                                        <option value={PartyType.ASSIGNEE}>{t('application.partyTypes.ASSIGNEE', 'Assignee')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.parties.name', 'Full Name')}
                                    </label>
                                    <input
                                        type="text"
                                        value={party.snapshot_name || ''}
                                        onChange={(e) => handleUpdateParty(index, 'snapshot_name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.parties.email', 'Email')}
                                    </label>
                                    <input
                                        type="email"
                                        value={party.snapshot_email || ''}
                                        onChange={(e) => handleUpdateParty(index, 'snapshot_email', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.parties.phone', 'Phone')}
                                    </label>
                                    <input
                                        type="tel"
                                        value={party.phone || ''}
                                        onChange={(e) => handleUpdateParty(index, 'phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t('application.steps.parties.address', 'Address')}
                                    </label>
                                    <input
                                        type="text"
                                        value={party.snapshot_address || ''}
                                        onChange={(e) => handleUpdateParty(index, 'snapshot_address', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!proposedData.parties || proposedData.parties.length === 0) && (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            {t('application.steps.parties.noParties', 'No parties added yet.')}
                        </div>
                    )}
                </div>
            </div>

            {/* Documents/Attachments Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.steps.attachments.title', 'Documents')}
                    {attachmentsChanged && (
                        <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                            {t('common.modified', '(modified)')}
                        </span>
                    )}
                </h3>

                {/* Existing Attachments */}
                {originalData.attachments && originalData.attachments.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            {t('amendment.existingDocuments', 'Existing Documents')}
                        </h4>
                        <div className="space-y-2">
                            {originalData.attachments.map((attachment) => {
                                const isRemoved = removedAttachmentIds.has(attachment.id);
                                return (
                                    <div
                                        key={attachment.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                            isRemoved
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="material-symbols-outlined text-slate-400 mr-2">
                                                description
                                            </span>
                                            <div>
                                                <p className={`text-sm font-medium ${isRemoved ? 'text-red-600 dark:text-red-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {attachment.original_filename}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {docTypeLabels[attachment.doc_type] || attachment.doc_type}
                                                    {attachment.page_count && ` • ${attachment.page_count} pages`}
                                                </p>
                                            </div>
                                        </div>
                                        {isRemoved ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRestoreAttachment(attachment.id)}
                                                className="flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                                            >
                                                <span className="material-symbols-outlined text-sm mr-1">undo</span>
                                                {t('common.restore', 'Restore')}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingAttachment(attachment.id)}
                                                className="flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                                            >
                                                <span className="material-symbols-outlined text-sm mr-1">delete</span>
                                                {t('common.remove', 'Remove')}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* New Attachments */}
                {newAttachments.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            {t('amendment.newDocuments', 'New Documents to Upload')}
                        </h4>
                        <div className="space-y-2">
                            {newAttachments.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                >
                                    <div className="flex items-center">
                                        <span className="material-symbols-outlined text-green-500 mr-2">
                                            add_circle
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                                {item.file.name}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                {docTypeLabels[item.doc_type] || item.doc_type} • {(item.file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewAttachment(index)}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload New Document */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                        >
                            <option value={AttachmentType.DESCRIPTION}>{docTypeLabels.DESCRIPTION}</option>
                            <option value={AttachmentType.CLAIMS}>{docTypeLabels.CLAIMS}</option>
                            <option value={AttachmentType.ABSTRACT}>{docTypeLabels.ABSTRACT}</option>
                            <option value={AttachmentType.DRAWINGS}>{docTypeLabels.DRAWINGS}</option>
                            <option value={AttachmentType.PRIORITY_DOC}>{docTypeLabels.PRIORITY_DOC}</option>
                            <option value="POA">{docTypeLabels.POA}</option>
                            <option value="ASSIGNMENT">{docTypeLabels.ASSIGNMENT}</option>
                            <option value="DECLARATION">{docTypeLabels.DECLARATION}</option>
                            <option value={AttachmentType.OTHER}>{docTypeLabels.OTHER}</option>
                        </select>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md"
                        >
                            <span className="material-symbols-outlined mr-2 text-lg">upload_file</span>
                            {t('application.steps.attachments.upload', 'Upload File')}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {t('application.steps.attachments.formats', 'Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG')}
                    </p>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('application.metrics.title', 'Metrics')}
                    {isChanged('metrics') && (
                        <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">
                            {t('common.modified', '(modified)')}
                        </span>
                    )}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.metrics.descriptionPages', 'Description Pages')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={proposedData.metrics?.description_pages || ''}
                            onChange={(e) => setFieldValue('metrics.description_pages', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.metrics.claimsTotal', 'Total Claims')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={proposedData.metrics?.claims_total || ''}
                            onChange={(e) => setFieldValue('metrics.claims_total', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.metrics.independentClaims', 'Independent Claims')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={proposedData.metrics?.claims_independent || ''}
                            onChange={(e) => setFieldValue('metrics.claims_independent', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('application.metrics.drawings', 'Drawings')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={proposedData.metrics?.drawings_images || ''}
                            onChange={(e) => setFieldValue('metrics.drawings_images', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Change Summary Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {t('amendment.changeSummary.title', 'Change Summary')}
                    <span className="text-red-500 ml-1">*</span>
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {t('amendment.changeSummary.description', 'Please describe the reason for these changes and what was modified.')}
                </p>

                {/* Auto-detected changes */}
                {hasAnyChanges && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t('amendment.changeSummary.detectedChanges', 'Detected changes:')}
                        </p>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            {getChangeSummary().map((change, idx) => (
                                <li key={idx} className="flex items-center">
                                    <span className="material-symbols-outlined text-amber-500 text-sm mr-1">change_circle</span>
                                    {change}
                                </li>
                            ))}
                            {newAttachments.length > 0 && (
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-green-500 text-sm mr-1">add_circle</span>
                                    {t('amendment.changes.addedDocuments', 'Added {{count}} document(s)', { count: newAttachments.length })}
                                </li>
                            )}
                            {removedAttachmentIds.size > 0 && (
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-red-500 text-sm mr-1">remove_circle</span>
                                    {t('amendment.changes.removedDocuments', 'Removed {{count}} document(s)', { count: removedAttachmentIds.size })}
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <textarea
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder={t('amendment.changeSummary.placeholder', 'Describe your changes here...')}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => {
                        resetChanges();
                        setNewAttachments([]);
                        setRemovedAttachmentIds(new Set());
                    }}
                    disabled={!hasAnyChanges || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('common.reset', 'Reset Changes')}
                </button>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasAnyChanges || !changeSummary.trim() || isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting && (
                            <span className="material-symbols-outlined animate-spin mr-2 text-lg">progress_activity</span>
                        )}
                        {t('amendment.submit', 'Submit Amendment')}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            {t('amendment.confirm.title', 'Confirm Amendment Submission')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {t('amendment.confirm.message', 'Are you sure you want to submit this amendment? A staff member will review your changes before they are applied.')}
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                {t('amendment.confirm.changes', 'Changes to submit:')}
                            </p>
                            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                {getChangeSummary().map((change, idx) => (
                                    <li key={idx}>• {change}</li>
                                ))}
                                {newAttachments.length > 0 && (
                                    <li className="text-green-600 dark:text-green-400">
                                        • {t('amendment.changes.addedDocuments', 'Added {{count}} document(s)', { count: newAttachments.length })}
                                    </li>
                                )}
                                {removedAttachmentIds.size > 0 && (
                                    <li className="text-red-600 dark:text-red-400">
                                        • {t('amendment.changes.removedDocuments', 'Removed {{count}} document(s)', { count: removedAttachmentIds.size })}
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={confirmSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                            >
                                {t('common.confirm', 'Confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AmendmentEditor;
