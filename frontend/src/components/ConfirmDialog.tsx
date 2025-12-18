import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'danger',
    onConfirm,
    onCancel,
}) => {
    const { t } = useTranslation();
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    // Focus management
    useEffect(() => {
        if (isOpen && confirmButtonRef.current) {
            confirmButtonRef.current.focus();
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    // Prevent body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'delete',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            confirmBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: 'info',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="confirm-dialog-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    ref={dialogRef}
                    className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-2xl transition-all"
                >
                    <div className="p-6">
                        {/* Icon */}
                        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
                            <span className={`material-symbols-outlined ${styles.iconColor} !text-2xl`}>
                                {styles.icon}
                            </span>
                        </div>

                        {/* Title */}
                        {title && (
                            <h3
                                id="confirm-dialog-title"
                                className="mt-4 text-center text-lg font-semibold text-slate-900 dark:text-white"
                            >
                                {title}
                            </h3>
                        )}

                        {/* Message */}
                        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            >
                                {cancelText || t('common.cancel')}
                            </button>
                            <button
                                ref={confirmButtonRef}
                                type="button"
                                onClick={onConfirm}
                                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${styles.confirmBg} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
                            >
                                {confirmText || t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
