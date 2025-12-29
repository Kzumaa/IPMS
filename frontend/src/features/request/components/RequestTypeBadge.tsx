import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RequestType } from '../types/enums';

interface RequestTypeBadgeProps {
  type: RequestType;
  size?: 'sm' | 'md' | 'lg';
}

const typeColors: Record<RequestType, string> = {
  AMENDMENT: 'bg-blue-100 text-blue-800',
  ASSIGNMENT: 'bg-purple-100 text-purple-800',
  LICENSE: 'bg-green-100 text-green-800',
  SPLIT: 'bg-orange-100 text-orange-800',
  CONVERSION: 'bg-teal-100 text-teal-800',
  APPEAL: 'bg-red-100 text-red-800',
};

const RequestTypeBadge: React.FC<RequestTypeBadgeProps> = ({ type, size = 'md' }) => {
  const { t } = useTranslation();
  const colorClasses = typeColors[type] || 'bg-gray-100 text-gray-800';
  const label = t(`request.types.${type}`);

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

export default RequestTypeBadge;
