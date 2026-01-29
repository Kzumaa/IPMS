import React, { useState, useRef, useEffect } from "react";
import { type UseFormRegisterReturn, type FieldError } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface FormComboboxProps {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  setValue: (
    name: any,
    value: any,
    config?: { shouldValidate?: boolean },
  ) => void;
  error?: FieldError;
  helperText?: string;
  defaultValue?: string;
}

const FormCombobox: React.FC<FormComboboxProps> = ({
  label,
  name,
  options,
  placeholder,
  required,
  register,
  setValue,
  error,
  helperText,
  defaultValue = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync internal state with external value changes (if any)
  useEffect(() => {
    if (defaultValue !== inputValue) {
      // Only update if significantly different to avoid loop?
      // Actually for simple implementation we might just trust local state unless reset
    }
  }, [defaultValue]);

  const handleSelect = (option: Option) => {
    setInputValue(option.value);
    setValue(name, option.value, { shouldValidate: true });
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Determine the onChange handler from register
    register.onChange(e);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
            ${error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-600"}
            bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors`}
          {...register}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />

        {/* Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                  onClick={() => handleSelect(option)}
                >
                  <span className="font-medium">{option.value}</span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400 text-xs">
                    - {option.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormCombobox;
