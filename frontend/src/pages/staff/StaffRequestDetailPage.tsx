import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchRequest,
    startRequestExamination,
    approveRequest,
    refuseRequest,
    resolveAppeal,
    resolveComplaint,
    clearCurrentRequest,
} from '@/features/staff/store/staffSlice';
import { RequestStatusBadge, RequestTypeBadge } from '@/features/request/components';
import type { RequestType, RequestStatus } from '@/features/request/types/enums';
import PendingVersionComparison from '@/features/staff/components/PendingVersionComparison';

export default function StaffRequestDetailPage() {
    const { t } = useTranslation();
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentRequest, requestsLoading, requestsError, examinationLoading } = useAppSelector(
        (state) => state.staff
    );

    const [notes, setNotes] = useState('');
    const [appealResolution, setAppealResolution] = useState<'UPHELD' | 'OVERTURNED' | 'PARTIAL' | 'WITHDRAWN'>('UPHELD');
    const [complaintResolution, setComplaintResolution] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showAppealModal, setShowAppealModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);

    useEffect(() => {
        if (requestId) {
            dispatch(fetchRequest(parseInt(requestId, 10)));
        }
        return () => {
            dispatch(clearCurrentRequest());
        };
    }, [dispatch, requestId]);

    const handleStartExamination = async () => {
        if (!currentRequest) return;
        await dispatch(startRequestExamination(currentRequest.id));
    };

    const handleApprove = async () => {
        if (!currentRequest) return;
        await dispatch(approveRequest({ requestId: currentRequest.id, notes: notes || undefined }));
        setShowApproveModal(false);
        setNotes('');
        navigate('/staff/requests');
    };

    const handleRefuse = async () => {
        if (!currentRequest || !notes) return;
        await dispatch(refuseRequest({ requestId: currentRequest.id, notes }));
        setShowRefuseModal(false);
        setNotes('');
        navigate('/staff/requests');
    };

    const handleResolveAppeal = async () => {
        if (!currentRequest) return;
        await dispatch(resolveAppeal({
            requestId: currentRequest.id,
            data: { resolution: appealResolution, notes: notes || undefined },
        }));
        setShowAppealModal(false);
        setNotes('');
        navigate('/staff/requests');
    };

    const handleResolveComplaint = async () => {
        if (!currentRequest) return;
        await dispatch(resolveComplaint({
            requestId: currentRequest.id,
            data: { resolution: complaintResolution, notes: notes || undefined },
        }));
        setShowComplaintModal(false);
        setNotes('');
        navigate('/staff/requests');
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (requestsLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">refresh</span>
                <span className="text-slate-500">{t('staff.requests.loading')}</span>
            </div>
        );
    }

    if (requestsError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{requestsError}</div>
                </div>
            </div>
        );
    }

    if (!currentRequest) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">search_off</span>
                    <h3 className="text-lg font-medium text-gray-900">{t('staff.requests.notFound')}</h3>
                </div>
            </div>
        );
    }

    const canStartExamination = currentRequest.status === 'SUBMITTED';
    const canProcess = currentRequest.status === 'EXAMINING';
    const isAppeal = currentRequest.type === 'APPEAL';
    const isComplaint = currentRequest.type === 'COMPLAINT';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/staff/requests"
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            REQ-{currentRequest.id}
                        </h1>
                        <p className="text-slate-500">
                            {currentRequest.application?.filing_number || `APP-${currentRequest.application_id}`}
                            {' - '}
                            {currentRequest.application?.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <RequestTypeBadge type={currentRequest.type as RequestType} />
                    <RequestStatusBadge status={currentRequest.status as RequestStatus} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">{t('staff.requests.details')}</h2>

                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">{t('staff.requests.requestDate')}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(currentRequest.request_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">{t('staff.requests.creator')}</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {currentRequest.creator?.name || '-'}
                                    {currentRequest.creator?.email && (
                                        <span className="text-gray-500 ml-1">({currentRequest.creator.email})</span>
                                    )}
                                </dd>
                            </div>
                            {currentRequest.processed_at && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('staff.requests.processedDate')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(currentRequest.processed_at)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Type-specific Details */}
                    {currentRequest.amendment && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.amendment.details')}</h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.amendment.sections', 'Affected Sections')}</dt>
                                    <dd className="mt-1">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(currentRequest.amendment.section) && currentRequest.amendment.section.length > 0 ? (
                                                currentRequest.amendment.section.map((sec: string, idx: number) => (
                                                    <span key={idx} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                                                        {sec.replace(/_/g, ' ')}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">-</span>
                                            )}
                                        </div>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.amendment.changeSummary')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                        {currentRequest.amendment.change_summary}
                                    </dd>
                                </div>
                                {currentRequest.amendment.field_name && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('request.amendment.fieldName')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{currentRequest.amendment.field_name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('request.amendment.oldValue')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{currentRequest.amendment.old_value || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t('request.amendment.newValue')}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{currentRequest.amendment.new_value || '-'}</dd>
                                        </div>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {/* Pending Version Comparison for Edit-mode Amendments */}
                    {currentRequest.type === 'AMENDMENT' && currentRequest.amendment?.pending_version_id && (
                        <PendingVersionComparison applicationId={currentRequest.application_id} />
                    )}

                    {currentRequest.assignment && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.assignment.details')}</h2>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.assignment.transferType')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {t(`request.assignment.transferTypes.${currentRequest.assignment.transfer_type}`)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.assignment.assignor')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {currentRequest.assignment.assignor?.name || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.assignment.assignee')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {currentRequest.assignment.assignee?.name || '-'}
                                    </dd>
                                </div>
                                {currentRequest.assignment.contract_number && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('request.assignment.contractNumber')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{currentRequest.assignment.contract_number}</dd>
                                    </div>
                                )}
                                {currentRequest.assignment.contract_date && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('request.assignment.contractDate')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(currentRequest.assignment.contract_date)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {currentRequest.license && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.license.details')}</h2>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.licenseType')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {t(`request.license.licenseTypes.${currentRequest.license.license_type}`)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.validFrom', 'Valid From')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(currentRequest.license.valid_from)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.validTo', 'Valid To')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(currentRequest.license.valid_to)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.licensor')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {currentRequest.license.licensor?.name || '-'}
                                    </dd>
                                </div>
                                {currentRequest.license.licensees && currentRequest.license.licensees.length > 0 && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500 mb-2">
                                            {t('request.license.licensees', 'Licensees')} ({currentRequest.license.licensees.length})
                                        </dt>
                                        <dd className="mt-1 space-y-2">
                                            {currentRequest.license.licensees.map((licensee, idx) => (
                                                <div
                                                    key={`${licensee.id}-${idx}`}
                                                    className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg"
                                                >
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="material-symbols-outlined text-indigo-600 !text-base">
                                                            person
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{licensee.name}</p>
                                                        <p className="text-xs text-gray-500">{licensee.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </dd>
                                    </div>
                                )}
                                {currentRequest.license.scope_territory && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('request.license.scopeTerritory')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{currentRequest.license.scope_territory}</dd>
                                    </div>
                                )}
                                {currentRequest.license.scope_products && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">{t('request.license.scopeProducts')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{currentRequest.license.scope_products}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {currentRequest.appeal && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.appeal.details')}</h2>
                            <dl className="space-y-4">
                                {currentRequest.appeal.notice_date && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('request.appeal.noticeDate')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(currentRequest.appeal.notice_date)}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.appeal.grounds')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                        {currentRequest.appeal.grounds}
                                    </dd>
                                </div>
                                {currentRequest.appeal.resolution && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t('request.appeal.resolution')}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {t(`request.appeal.resolutions.${currentRequest.appeal.resolution}`)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {currentRequest.complaint && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {/* Complaint Header with Status */}
                            <div className={`px-6 py-4 ${
                                currentRequest.complaint.resolution === 'ACCEPTED'
                                    ? 'bg-green-50 border-b border-green-200'
                                    : currentRequest.complaint.resolution === 'REJECTED'
                                    ? 'bg-red-50 border-b border-red-200'
                                    : 'bg-amber-50 border-b border-amber-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            currentRequest.complaint.resolution === 'ACCEPTED'
                                                ? 'bg-green-100'
                                                : currentRequest.complaint.resolution === 'REJECTED'
                                                ? 'bg-red-100'
                                                : 'bg-amber-100'
                                        }`}>
                                            <span className={`material-symbols-outlined !text-xl ${
                                                currentRequest.complaint.resolution === 'ACCEPTED'
                                                    ? 'text-green-600'
                                                    : currentRequest.complaint.resolution === 'REJECTED'
                                                    ? 'text-red-600'
                                                    : 'text-amber-600'
                                            }`}>
                                                {currentRequest.complaint.resolution === 'ACCEPTED'
                                                    ? 'check_circle'
                                                    : currentRequest.complaint.resolution === 'REJECTED'
                                                    ? 'cancel'
                                                    : 'report'
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {t('request.complaint.details')}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {t('request.complaint.attemptNumber', 'Attempt {{number}} of {{max}}', {
                                                    number: currentRequest.complaint.complaint_number,
                                                    max: 3
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {currentRequest.complaint.resolution && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            currentRequest.complaint.resolution === 'ACCEPTED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {t(`request.complaint.resolutions.${currentRequest.complaint.resolution}`)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Complaint Content */}
                            <div className="p-6 space-y-6">
                                {/* Deadline Warning */}
                                {!currentRequest.complaint.resolution && currentRequest.complaint.deadline && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="material-symbols-outlined text-blue-600">schedule</span>
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">
                                                {t('request.complaint.deadlineInfo', 'Filing Deadline')}
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                {formatDate(currentRequest.complaint.deadline)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Grounds for Complaint - Main Content */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined !text-lg">description</span>
                                        {t('request.complaint.grounds')}
                                    </h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                            {currentRequest.complaint.grounds}
                                        </p>
                                    </div>
                                </div>

                                {/* Resolution Info (if resolved) */}
                                {currentRequest.complaint.resolution && currentRequest.complaint.resolved_at && (
                                    <div className={`p-4 rounded-lg border ${
                                        currentRequest.complaint.resolution === 'ACCEPTED'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined !text-lg">
                                                {currentRequest.complaint.resolution === 'ACCEPTED' ? 'task_alt' : 'block'}
                                            </span>
                                            {t('request.complaint.resolutionDetails', 'Resolution Details')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">{t('request.complaint.resolution')}:</span>
                                                <span className={`ml-2 font-medium ${
                                                    currentRequest.complaint.resolution === 'ACCEPTED'
                                                        ? 'text-green-700'
                                                        : 'text-red-700'
                                                }`}>
                                                    {t(`request.complaint.resolutions.${currentRequest.complaint.resolution}`)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('request.complaint.resolvedAt')}:</span>
                                                <span className="ml-2 font-medium text-gray-900">
                                                    {formatDate(currentRequest.complaint.resolved_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {currentRequest.complaint.resolution === 'ACCEPTED'
                                                ? t('staff.requests.complaintAcceptedInfo')
                                                : t('staff.requests.complaintRejectedInfo')
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {currentRequest.complaint.complaint_number}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            {t('request.complaint.attemptNo', 'Attempt #')}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-600">
                                            {3 - currentRequest.complaint.complaint_number}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            {t('request.complaint.remaining', 'Remaining')}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-600">
                                            {currentRequest.complaint.grounds?.length || 0}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            {t('request.complaint.characters', 'Characters')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processing Notes */}
                    {currentRequest.notes && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.processingNotes')}</h2>
                            <p className="text-gray-900 whitespace-pre-wrap">{currentRequest.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Actions */}
                <div className="space-y-6">
                    {/* Fee Info */}
                    {currentRequest.fee_quote && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">{t('request.feeQuote')}</h2>
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">{t('request.totalFee')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {currentRequest.fee_quote.total_amount.toLocaleString('vi-VN')} VND
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">{t('request.feeStatus')}</dt>
                                    <dd className={`text-sm font-medium ${currentRequest.fee_quote.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {currentRequest.fee_quote.status}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">{t('staff.requests.actions')}</h2>

                        <div className="space-y-3">
                            {canStartExamination && (
                                <button
                                    onClick={handleStartExamination}
                                    disabled={examinationLoading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined mr-2 !text-lg align-middle">play_arrow</span>
                                    {t('staff.requests.startExamination')}
                                </button>
                            )}

                            {canProcess && !isAppeal && !isComplaint && (
                                <>
                                    <button
                                        onClick={() => setShowApproveModal(true)}
                                        disabled={examinationLoading}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined mr-2 !text-lg align-middle">check_circle</span>
                                        {t('staff.requests.approve')}
                                    </button>
                                    <button
                                        onClick={() => setShowRefuseModal(true)}
                                        disabled={examinationLoading}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined mr-2 !text-lg align-middle">cancel</span>
                                        {t('staff.requests.refuse')}
                                    </button>
                                </>
                            )}

                            {canProcess && isAppeal && (
                                <button
                                    onClick={() => setShowAppealModal(true)}
                                    disabled={examinationLoading}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined mr-2 !text-lg align-middle">gavel</span>
                                    {t('staff.requests.resolveAppeal')}
                                </button>
                            )}

                            {canProcess && isComplaint && (
                                <button
                                    onClick={() => setShowComplaintModal(true)}
                                    disabled={examinationLoading}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined mr-2 !text-lg align-middle">report</span>
                                    {t('staff.requests.resolveComplaint')}
                                </button>
                            )}

                            <Link
                                to={`/staff/applications/${currentRequest.application_id}`}
                                className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                <span className="material-symbols-outlined mr-2 !text-lg align-middle">description</span>
                                {t('staff.requests.viewApplication')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">{t('staff.requests.confirmApprove')}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('staff.requests.notes')} ({t('common.optional')})
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowApproveModal(false); setNotes(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={examinationLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {t('staff.requests.approve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refuse Modal */}
            {showRefuseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">{t('staff.requests.confirmRefuse')}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('staff.requests.refuseReason')} *
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowRefuseModal(false); setNotes(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleRefuse}
                                disabled={examinationLoading || !notes}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {t('staff.requests.refuse')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Appeal Resolution Modal */}
            {showAppealModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">{t('staff.requests.resolveAppeal')}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('request.appeal.resolution')} *
                            </label>
                            <select
                                value={appealResolution}
                                onChange={(e) => setAppealResolution(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="UPHELD">{t('request.appeal.resolutions.UPHELD')}</option>
                                <option value="OVERTURNED">{t('request.appeal.resolutions.OVERTURNED')}</option>
                                <option value="PARTIAL">{t('request.appeal.resolutions.PARTIAL')}</option>
                                <option value="WITHDRAWN">{t('request.appeal.resolutions.WITHDRAWN')}</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('staff.requests.notes')} ({t('common.optional')})
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowAppealModal(false); setNotes(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleResolveAppeal}
                                disabled={examinationLoading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {t('staff.requests.resolve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaint Resolution Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">{t('staff.requests.resolveComplaint')}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('request.complaint.resolution')} *
                            </label>
                            <select
                                value={complaintResolution}
                                onChange={(e) => setComplaintResolution(e.target.value as 'ACCEPTED' | 'REJECTED')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ACCEPTED">{t('request.complaint.resolutions.ACCEPTED')}</option>
                                <option value="REJECTED">{t('request.complaint.resolutions.REJECTED')}</option>
                            </select>
                        </div>
                        <div className="mb-4 p-4 rounded-lg bg-blue-50">
                            <p className="text-sm text-blue-800">
                                {complaintResolution === 'ACCEPTED'
                                    ? t('staff.requests.complaintAcceptedInfo')
                                    : t('staff.requests.complaintRejectedInfo')}
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('staff.requests.notes')} ({t('common.optional')})
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowComplaintModal(false); setNotes(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleResolveComplaint}
                                disabled={examinationLoading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {t('staff.requests.resolve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
