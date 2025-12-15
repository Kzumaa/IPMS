import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: FieldError;
    register: UseFormRegisterReturn;
    helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    type = 'text',
    placeholder,
    required = false,
    disabled = false,
    error,
    register,
    helperText,
}) => {
    return (
        <div className="mb-4">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...register}
                className={`
          w-full px-3 py-2 rounded-lg border
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

export default FormInput;
