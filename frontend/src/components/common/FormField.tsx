import { ReactNode } from "react";

/**
 * Shared building blocks for every form control (FormInput, FormSelect, PasswordInput)
 * so labels, errors and borders look identical across the app.
 */

interface InputClassOptions {
  hasError?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}

export function getInputClass({ hasError, hasLeftIcon, hasRightIcon }: InputClassOptions = {}) {
  return [
    "w-full py-2 border rounded-lg text-sm transition-colors",
    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
    "placeholder-gray-400 dark:placeholder-gray-500",
    "focus:outline-none focus:ring-2",
    "disabled:bg-gray-100 dark:disabled:bg-gray-900/60 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed",
    hasLeftIcon ? "pl-10" : "pl-3",
    hasRightIcon ? "pr-10" : "pr-3",
    hasError
      ? "border-rose-500 focus:ring-rose-500/30"
      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500",
  ].join(" ");
}

interface FormLabelProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  /** Optional element on the right of the label (e.g. "Forgot password?" link) */
  action?: ReactNode;
}

export function FormLabel({ htmlFor, label, required, action }: FormLabelProps) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {action}
    </div>
  );
}

interface FieldMessageProps {
  error?: string;
  hint?: string;
}

/** Shows the error if present, otherwise the optional hint text. */
export function FieldMessage({ error, hint }: FieldMessageProps) {
  if (error) {
    return (
      <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
        {error}
      </p>
    );
  }
  if (hint) {
    return <p className="text-xs text-gray-400 mt-1">{hint}</p>;
  }
  return null;
}
