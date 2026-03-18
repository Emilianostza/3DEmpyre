import React from 'react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, hint, id, ...props }) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-2 rounded-lg border text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-zinc-200 dark:border-zinc-700'
        }`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
};
