import React from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationStatus, ApplicationStatusColors } from '../types/enums';

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    size?: 'sm' | 'md' | 'lg';
}

const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
    status,
    size = 'md',
}) => {
    const { t } = useTranslation();
    const colors = ApplicationStatusColors[status] || ApplicationStatusColors[ApplicationStatus.DRAFT];
    const label = t(`application.statuses.${status}`);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center rounded-full font-medium
        ${colors.bg} ${colors.text} ${colors.border}
        border
        ${sizeClasses[size]}
      `}
        >
            {label}
        </span>
    );
};

export default ApplicationStatusBadge;
