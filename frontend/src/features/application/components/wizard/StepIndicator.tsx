import React from 'react';
import { useTranslation } from 'react-i18next';

interface Step {
    id: number;
    titleKey: string;
    descriptionKey?: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
    steps,
    currentStep,
    onStepClick,
}) => {
    const { t } = useTranslation();

    return (
        <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isClickable = onStepClick && step.id <= currentStep;

                    return (
                        <li
                            key={step.id}
                            className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}
                        >
                            <div className="flex items-center">
                                {/* Step Circle */}
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepClick(step.id)}
                                    disabled={!isClickable}
                                    className={`
                    relative flex h-10 w-10 items-center justify-center rounded-full
                    transition-all duration-200
                    ${isCompleted
                                            ? 'bg-indigo-600 hover:bg-indigo-700'
                                            : isCurrent
                                                ? 'border-2 border-indigo-600 bg-white dark:bg-slate-800'
                                                : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                        }
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isCompleted ? (
                                        <span className="material-symbols-outlined text-white !text-xl">check</span>
                                    ) : (
                                        <span
                                            className={`text-sm font-medium
                        ${isCurrent
                                                    ? 'text-indigo-600'
                                                    : 'text-slate-500 dark:text-slate-400'
                                                }
                      `}
                                        >
                                            {step.id}
                                        </span>
                                    )}
                                </button>

                                {/* Connector Line */}
                                {index !== steps.length - 1 && (
                                    <div
                                        className={`
                      hidden sm:block flex-1 h-0.5 mx-4
                      ${isCompleted ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                                    />
                                )}
                            </div>

                            {/* Step Label */}
                            <div className="mt-2 hidden sm:block min-w-max">
                                <span
                                    className={`text-sm font-medium
                    ${isCurrent
                                            ? 'text-indigo-600'
                                            : isCompleted
                                                ? 'text-slate-900 dark:text-white'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }
                  `}
                                >
                                    {t(step.titleKey)}
                                </span>
                                {step.descriptionKey && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {t(step.descriptionKey)}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            {/* Mobile Step Label */}
            <div className="sm:hidden mt-4 text-center">
                <span className="text-sm font-medium text-indigo-600">
                    {t('application.form.step', { step: currentStep })}: {t(steps.find(s => s.id === currentStep)?.titleKey || '')}
                </span>
            </div>
        </nav>
    );
};

export default StepIndicator;
