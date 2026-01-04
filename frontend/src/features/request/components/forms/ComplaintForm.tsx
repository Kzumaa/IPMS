import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { complaintSchema, type ComplaintFormData } from '../../schemas/requestSchemas';

interface ComplaintFormProps {
  defaultValues?: Partial<ComplaintFormData>;
  onSubmit: (data: ComplaintFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  complaintNumber?: number;
  remainingComplaints?: number;
  maxComplaints?: number;
  decisionDate?: string;
  deadline?: string;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  loading = false,
  complaintNumber = 1,
  remainingComplaints = 3,
  maxComplaints = 3,
  decisionDate,
  deadline,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      grounds: defaultValues?.grounds || '',
    },
  });

  const isMaxReached = remainingComplaints <= 0;
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Complaint Status Banner */}
      <div className={`p-4 rounded-lg border ${
        isMaxReached
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isMaxReached
                ? 'bg-red-100 dark:bg-red-800'
                : 'bg-indigo-100 dark:bg-indigo-800'
            }`}>
              <span className={`material-symbols-outlined !text-2xl ${
                isMaxReached
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {isMaxReached ? 'block' : 'gavel'}
              </span>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                isMaxReached
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-indigo-700 dark:text-indigo-300'
              }`}>
                {isMaxReached
                  ? t('request.complaint.maxReached', 'Maximum complaints reached')
                  : t('request.complaint.complaintNumber', 'Complaint {{number}} of {{max}}', {
                      number: complaintNumber,
                      max: maxComplaints,
                    })
                }
              </p>
              <p className={`text-xs ${
                isMaxReached
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {isMaxReached
                  ? t('request.complaint.noMoreComplaints', 'You cannot file any more complaints for this application')
                  : t('request.complaint.remainingComplaints', '{{remaining}} complaint(s) remaining', {
                      remaining: remainingComplaints,
                    })
                }
              </p>
            </div>
          </div>

          {/* Complaint Progress Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxComplaints }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < complaintNumber
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-600'
                }`}
                title={t('request.complaint.complaintDot', 'Complaint {{number}}', { number: index + 1 })}
              />
            ))}
          </div>
        </div>

        {/* Decision and Deadline Info */}
        {(decisionDate || deadline) && (
          <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700 grid grid-cols-2 gap-4 text-sm">
            {decisionDate && (
              <div>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {t('request.complaint.decisionDate', 'Decision Date')}:
                </span>{' '}
                <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                  {formatDate(decisionDate)}
                </span>
              </div>
            )}
            {deadline && (
              <div>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {t('request.complaint.deadline', 'Complaint Deadline')}:
                </span>{' '}
                <span className="text-indigo-800 dark:text-indigo-200 font-medium">
                  {formatDate(deadline)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {isMaxReached && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 !text-lg mt-0.5">
              info
            </span>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('request.complaint.maxReachedInfo', 'You have filed the maximum number of complaints ({{max}}) allowed for this application. Consider other legal options or consulting with a legal professional.', { max: maxComplaints })}
            </p>
          </div>
        </div>
      )}

      {/* Grounds */}
      <div>
        <label
          htmlFor="grounds"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {t('request.complaint.grounds', 'Grounds for Complaint')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="grounds"
          {...register('grounds')}
          rows={8}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={t('request.complaint.groundsPlaceholder', 'Provide detailed grounds for your complaint. Include specific facts and legal basis for your objection to the decision...')}
        />
        {errors.grounds && (
          <p className="mt-1 text-sm text-red-600">{errors.grounds.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('request.complaint.groundsHelp', 'Minimum 50 characters. Be specific about why you believe the decision was incorrect.')}
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mr-3">
            warning
          </span>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">{t('request.complaint.deadlineWarning', 'Deadline Notice')}</p>
            <p>{t('request.complaint.deadlineWarningDesc', 'You must file your complaint within 90 days of receiving the decision. Complaints filed after the deadline will not be accepted.')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600
            rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={loading || isMaxReached}
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin mr-2 !text-lg">refresh</span>
          )}
          {isMaxReached
            ? t('request.complaint.cannotComplain', 'Cannot File Complaint')
            : t('request.complaint.fileComplaint', 'File Complaint')
          }
        </button>
      </div>
    </form>
  );
};

export default ComplaintForm;
