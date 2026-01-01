import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PaymentStatus } from '../types/paymentTypes';

interface PaymentStatusBadgeProps {
    status: PaymentStatus | null;
    size?: 'sm' | 'md' | 'lg';
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
    status,
    size = 'md',
}) => {
    const { t } = useTranslation();

    if (!status) {
        return null;
    }

    const statusConfig: Record<PaymentStatus, { color: string; icon: string }> = {
        PENDING: {
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            icon: 'schedule',
        },
        PROCESSING: {
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            icon: 'sync',
        },
        COMPLETED: {
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            icon: 'check_circle',
        },
        FAILED: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            icon: 'error',
        },
        CANCELLED: {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            icon: 'cancel',
        },
        REFUNDED: {
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            icon: 'undo',
        },
        PARTIALLY_REFUNDED: {
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            icon: 'partial_refund',
        },
        EXPIRED: {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            icon: 'timer_off',
        },
    };

    const config = statusConfig[status];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1 rounded-full font-medium
                ${config.color}
                ${sizeClasses[size]}
            `}
        >
            <span className={`material-symbols-outlined ${iconSizes[size]}`}>
                {config.icon}
            </span>
            {t(`payment.statuses.${status}`)}
        </span>
    );
};

export default PaymentStatusBadge;
