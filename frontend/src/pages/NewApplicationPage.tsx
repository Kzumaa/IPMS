import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApplicationFormWizard } from '../features/application/components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchApplication, clearCurrentApplication } from '../features/application/store/applicationSlice';

const NewApplicationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { currentApplication, error } = useAppSelector((state) => state.application);
    const [isReady, setIsReady] = useState(false);

    const applicationId = id ? parseInt(id, 10) : undefined;
    const isEditing = !!applicationId;

    useEffect(() => {
        // Always clear first, then fetch if editing
        setIsReady(false);
        dispatch(clearCurrentApplication());

        if (applicationId) {
            // Fetch the application for edit mode
            dispatch(fetchApplication(applicationId));
        } else {
            // For create mode, we're ready immediately after clearing
            setIsReady(true);
        }
    }, [applicationId, dispatch]);

    // Mark ready when application is loaded for edit mode
    useEffect(() => {
        if (isEditing && currentApplication && currentApplication.id === applicationId) {
            setIsReady(true);
        }
    }, [isEditing, currentApplication, applicationId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearCurrentApplication());
        };
    }, [dispatch]);

    // Show loading or wait until ready
    if (!isReady) {
        // If there's an error, show it
        if (error) {
            return (
                <div className="flex flex-1 flex-col">
                    <main className="flex-1 p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
                                    <span className="text-red-700 dark:text-red-300">{error}</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        // Otherwise show loading state
        return (
            <div className="flex flex-1 flex-col">
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">refresh</span>
                            <span className="text-slate-600 dark:text-slate-400">{t('common.loading')}</span>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6">
                <ApplicationFormWizard
                    key={applicationId || 'new'}
                    applicationId={applicationId}
                    initialData={currentApplication || undefined}
                />
            </main>
        </div>
    );
};

export default NewApplicationPage;
