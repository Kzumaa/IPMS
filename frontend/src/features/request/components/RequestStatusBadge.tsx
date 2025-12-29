import React from 'react';
import { useTranslation } from 'react-i18next';
import { RequestStatus, RequestStatusColors } from '../types/enums';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();
  const colorClasses = RequestStatusColors[status] || RequestStatusColors.DRAFT;
  const label = t(`request.statuses.${status}`);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClasses} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
};

export default RequestStatusBadge;
