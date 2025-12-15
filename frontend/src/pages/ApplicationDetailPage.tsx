import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchApplication, deleteApplication } from '../features/application/store/applicationSlice';
import { ApplicationStatusBadge } from '../features/application/components';

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const ApplicationDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, parties, attachments, loading, error } = useAppSelector(
        (state) => state.application
    );

    useEffect(() => {
        if (id) {
            dispatch(fetchApplication(parseInt(id, 10)));
        }
    }, [id, dispatch]);

    const handleDelete = async () => {
        if (!currentApplication?.id) return;

        if (window.confirm(t('application.confirm.delete'))) {
            const result = await dispatch(deleteApplication(currentApplication.id));
            if (deleteApplication.fulfilled.match(result)) {
                navigate('/app/applications');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">refresh</span>
                <span className="text-slate-500 dark:text-slate-400">{t('application.loading')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('application.detail.loadError')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
                <Link
                    to="/app/applications"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    {t('application.detail.backToList')}
                </Link>
            </div>
        );
    }

    if (!currentApplication) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">search_off</span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {t('application.detail.notFound')}
                </h2>
                <Link
                    to="/app/applications"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    {t('application.detail.backToList')}
                </Link>
            </div>
        );
    }

    const applicants = parties.filter(p => p.party_type === 'APPLICANT');
    const inventors = parties.filter(p => p.party_type === 'INVENTOR');
    const representatives = parties.filter(p => p.party_type === 'REPRESENTATIVE');

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                to="/app/applications"
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {currentApplication.filing_number || `${t('application.title')} #${currentApplication.id}`}
                            </h1>
                            <ApplicationStatusBadge status={currentApplication.status} size="lg" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-10">
                            {currentApplication.title}
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {currentApplication.status === 'DRAFT' && (
                            <>
                                <Link
                                    to={`/app/applications/${currentApplication.id}/edit`}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined mr-2 !text-lg">edit</span>
                                    {t('application.detail.edit')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined mr-2 !text-lg">delete</span>
                                    {t('application.detail.delete')}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                {t('application.detail.basicInfo')}
                            </h3>

                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.table.appType')}</dt>
                                    <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                        {t(`application.appTypes.${currentApplication.app_type}`)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.filingDate')}</dt>
                                    <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                        {formatDate(currentApplication.filing_date)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.pctApplication')}</dt>
                                    <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                        {currentApplication.is_pct ? `${t('common.yes')} (${currentApplication.pct_number || '-'})` : t('common.no')}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.createdAt')}</dt>
                                    <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                        {formatDate(currentApplication.created_at)}
                                    </dd>
                                </div>

                                {currentApplication.priority_number && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('application.detail.priority')}</dt>
                                        <dd className="text-sm text-slate-900 dark:text-white mt-1">
                                            {currentApplication.priority_number} ({currentApplication.priority_country}) - {formatDate(currentApplication.priority_date)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Abstract */}
                        {currentApplication.abstract && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    {t('application.detail.abstract')}
                                </h3>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {currentApplication.abstract}
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        {currentApplication.description && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    {t('application.detail.description')}
                                </h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {currentApplication.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Claims */}
                        {currentApplication.claims && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    {t('application.detail.claims')}
                                </h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                        {currentApplication.claims}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Parties */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                {t('application.detail.parties')}
                            </h3>

                            <div className="space-y-4">
                                {/* Applicants */}
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                        {t('application.partyTypes.APPLICANT')} ({applicants.length})
                                    </h4>
                                    {applicants.length > 0 ? (
                                        <ul className="space-y-2">
                                            {applicants.map((party) => (
                                                <li key={party.id} className="text-sm text-slate-900 dark:text-white">
                                                    <strong>{party.name}</strong>
                                                    {party.email && (
                                                        <span className="text-slate-500 dark:text-slate-400 block text-xs">
                                                            {party.email}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">-</p>
                                    )}
                                </div>

                                {/* Inventors */}
                                {inventors.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                            {t('application.partyTypes.INVENTOR')} ({inventors.length})
                                        </h4>
                                        <ul className="space-y-1">
                                            {inventors.map((party) => (
                                                <li key={party.id} className="text-sm text-slate-900 dark:text-white">
                                                    {party.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Representatives */}
                                {representatives.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                            {t('application.partyTypes.REPRESENTATIVE')} ({representatives.length})
                                        </h4>
                                        <ul className="space-y-1">
                                            {representatives.map((party) => (
                                                <li key={party.id} className="text-sm text-slate-900 dark:text-white">
                                                    {party.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                {t('application.detail.attachments')} ({attachments.length})
                            </h3>

                            {attachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {attachments.map((attachment) => (
                                        <li
                                            key={attachment.id}
                                            className="flex items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded"
                                        >
                                            <span className="material-symbols-outlined text-slate-500 mr-2 !text-lg">
                                                description
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-900 dark:text-white truncate">
                                                    {attachment.file_name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {t(`application.attachmentTypes.${attachment.attachment_type}`)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('application.detail.noAttachments')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApplicationDetailPage;
