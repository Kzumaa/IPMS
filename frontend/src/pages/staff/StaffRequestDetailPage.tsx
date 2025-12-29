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
    clearCurrentRequest,
} from '@/features/staff/store/staffSlice';
import { RequestStatusBadge, RequestTypeBadge } from '@/features/request/components';

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
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showAppealModal, setShowAppealModal] = useState(false);

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
                    <RequestTypeBadge type={currentRequest.type} />
                    <RequestStatusBadge status={currentRequest.status} />
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
                                    <dt className="text-sm font-medium text-gray-500">{t('request.amendment.section')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {t(`request.amendment.sections.${currentRequest.amendment.section}`)}
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
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.duration')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(currentRequest.license.valid_from)} - {formatDate(currentRequest.license.valid_to)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.licensor')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {currentRequest.license.licensor?.name || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t('request.license.licensee')}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {currentRequest.license.licensee?.name || '-'}
                                    </dd>
                                </div>
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

                            {canProcess && !isAppeal && (
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
        </div>
    );
}
