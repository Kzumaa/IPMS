import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormCheckboxProps {
    label: string;
    name: string;
    disabled?: boolean;
    error?: FieldError;
    register: UseFormRegisterReturn;
    helperText?: string;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
    label,
    name,
    disabled = false,
    error,
    register,
    helperText,
}) => {
    return (
        <div className="mb-4">
            <label
                htmlFor={name}
                className="flex items-center cursor-pointer"
            >
                <input
                    id={name}
                    type="checkbox"
                    disabled={disabled}
                    {...register}
                    className={`
            w-4 h-4 rounded border
            text-indigo-600
            bg-white dark:bg-slate-800
            focus:ring-2 focus:ring-indigo-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
                            ? 'border-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                        }
          `}
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    {label}
                </span>
            </label>
            {helperText && !error && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 ml-6">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-500 ml-6">{error.message}</p>
            )}
        </div>
    );
};

export default FormCheckbox;
