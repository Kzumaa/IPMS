import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormTextareaProps {
    label: string;
    name: string;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    error?: FieldError;
    register: UseFormRegisterReturn;
    helperText?: string;
    currentLength?: number;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    name,
    placeholder,
    rows = 4,
    maxLength,
    required = false,
    disabled = false,
    error,
    register,
    helperText,
    currentLength = 0,
}) => {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {maxLength && (
                    <span className={`text-xs ${currentLength > maxLength ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        {currentLength.toLocaleString()} / {maxLength.toLocaleString()}
                    </span>
                )}
            </div>
            <textarea
                id={name}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                {...register}
                className={`
          w-full px-3 py-2 rounded-lg border resize-y
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-white
          placeholder-slate-400 dark:placeholder-slate-500
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed
          ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }
        `}
            />
            {helperText && !error && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error.message}</p>
            )}
        </div>
    );
};

export default FormTextarea;
