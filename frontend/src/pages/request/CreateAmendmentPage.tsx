import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAmendment } from '../../features/request/store/requestSlice';
import { AmendmentForm } from '../../features/request/components/forms';
import type { AmendmentFormData } from '../../features/request/schemas/requestSchemas';
import type { CreateAmendmentDTO } from '../../features/request/types/requestTypes';

const CreateAmendmentPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.request);
  const applicationId = parseInt(id || '0', 10);

  const handleSubmit = async (data: AmendmentFormData) => {
    const result = await dispatch(createAmendment({ applicationId, data: data as CreateAmendmentDTO }));
    if (createAmendment.fulfilled.match(result)) {
      navigate(`/app/applications/${applicationId}`);
    }
  };

  const handleCancel = () => {
    navigate(`/app/applications/${applicationId}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/app/applications/${applicationId}`}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('request.createAmendment')}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 max-w-2xl">
          <AmendmentForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default CreateAmendmentPage;
