import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ApplicationRequest } from '../types/requestTypes';
import RequestStatusBadge from './RequestStatusBadge';
import RequestTypeBadge from './RequestTypeBadge';
import {
  AmendmentSectionLabels,
  TransferTypeLabels,
  LicenseTypeLabels,
  AppealTypeLabels,
  AppealResolutionLabels,
} from '../types/enums';

interface RequestDetailProps {
  request: ApplicationRequest;
  onSubmit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  submitting?: boolean;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onSubmit,
  onDelete,
  loading = false,
  submitting = false,
}) => {
  const { t } = useTranslation();

  const renderAmendmentDetails = () => {
    if (!request.amendment) return null;
    const { amendment } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t('request.amendment.details')}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.amendment.section')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {AmendmentSectionLabels[amendment.section]}
            </dd>
          </div>
          {amendment.field_name && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.amendment.fieldName')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">{amendment.field_name}</dd>
            </div>
          )}
        </dl>
        <div>
          <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {t('request.amendment.changeSummary')}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            {amendment.change_summary}
          </dd>
        </div>
        {(amendment.old_value || amendment.new_value) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amendment.old_value && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t('request.amendment.oldValue')}
                </dt>
                <dd className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg line-through">
                  {amendment.old_value}
                </dd>
              </div>
            )}
            {amendment.new_value && (
              <div>
                <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {t('request.amendment.newValue')}
                </dt>
                <dd className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  {amendment.new_value}
                </dd>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAssignmentDetails = () => {
    if (!request.assignment) return null;
    const { assignment } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t('request.assignment.details')}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.assignment.transferType')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {TransferTypeLabels[assignment.transfer_type]}
            </dd>
          </div>
          {assignment.contract_number && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.assignment.contractNumber')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">{assignment.contract_number}</dd>
            </div>
          )}
          {assignment.contract_date && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.assignment.contractDate')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(assignment.contract_date)}
              </dd>
            </div>
          )}
        </dl>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignment.assignor && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t('request.assignment.assignor')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{assignment.assignor.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{assignment.assignor.email}</p>
              </dd>
            </div>
          )}
          {assignment.assignee && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t('request.assignment.assignee')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{assignment.assignee.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{assignment.assignee.email}</p>
              </dd>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLicenseDetails = () => {
    if (!request.license) return null;
    const { license } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t('request.license.details')}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.license.licenseType')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {LicenseTypeLabels[license.license_type]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.license.duration')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(license.valid_from)} - {formatDate(license.valid_to)}
            </dd>
          </div>
          {license.scope_territory && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.license.scopeTerritory')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">{license.scope_territory}</dd>
            </div>
          )}
          {license.contract_number && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.license.contractNumber')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">{license.contract_number}</dd>
            </div>
          )}
        </dl>
        {license.scope_products && (
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t('request.license.scopeProducts')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              {license.scope_products}
            </dd>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {license.licensor && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t('request.license.licensor')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{license.licensor.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{license.licensor.email}</p>
              </dd>
            </div>
          )}
          {license.licensee && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t('request.license.licensee')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                <p className="font-medium">{license.licensee.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{license.licensee.email}</p>
              </dd>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppealDetails = () => {
    if (!request.appeal) return null;
    const { appeal } = request;

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900 dark:text-white">
          {t('request.appeal.details')}
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.appeal.type')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {AppealTypeLabels[appeal.appeal_type]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.appeal.deadline')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white flex items-center">
              {formatDate(appeal.deadline)}
              {appeal.is_within_deadline ? (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined !text-sm">check_circle</span>
                </span>
              ) : (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined !text-sm">error</span>
                </span>
              )}
            </dd>
          </div>
          {appeal.resolution && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.appeal.resolution')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {AppealResolutionLabels[appeal.resolution]}
              </dd>
            </div>
          )}
          {appeal.resolved_at && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.appeal.resolvedAt')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(appeal.resolved_at)}
              </dd>
            </div>
          )}
        </dl>
        <div>
          <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {t('request.appeal.grounds')}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            {appeal.grounds}
          </dd>
        </div>
      </div>
    );
  };

  const renderTypeSpecificDetails = () => {
    switch (request.type) {
      case 'AMENDMENT':
        return renderAmendmentDetails();
      case 'ASSIGNMENT':
        return renderAssignmentDetails();
      case 'LICENSE':
        return renderLicenseDetails();
      case 'APPEAL':
        return renderAppealDetails();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-indigo-600 mr-2">
            refresh
          </span>
          <span className="text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RequestTypeBadge type={request.type} size="lg" />
            <span className="text-lg font-medium text-slate-900 dark:text-white">#{request.id}</span>
          </div>
          <RequestStatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t('request.table.date')}
            </dt>
            <dd className="text-sm text-slate-900 dark:text-white">
              {formatDate(request.request_date || request.created_at)}
            </dd>
          </div>
          {request.processed_date && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.processedDate')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">
                {formatDate(request.processed_date)}
              </dd>
            </div>
          )}
          {request.creator && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                {t('request.creator')}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white">{request.creator.name}</dd>
            </div>
          )}
        </div>

        {/* Type-specific details */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          {renderTypeSpecificDetails()}
        </div>

        {/* Fee Quote */}
        {request.fee_quote && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              {t('request.feeQuote')}
            </h4>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{t('request.totalFee')}</span>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(request.fee_quote.total_amount)}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t('request.feeStatus')}: {request.fee_quote.status}
              </div>
            </div>
          </div>
        )}

        {/* Processing Notes */}
        {request.processing_notes && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
              {t('request.processingNotes')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              {request.processing_notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(request.can_submit || request.can_edit) && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-end space-x-3">
            {request.can_edit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600
                  rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('common.delete')}
              </button>
            )}
            {request.can_submit && onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && (
                  <span className="material-symbols-outlined animate-spin mr-2 !text-lg">
                    refresh
                  </span>
                )}
                {t('request.submit')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
