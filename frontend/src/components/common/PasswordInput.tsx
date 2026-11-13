import { useState, useId, ReactNode, memo } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { FormLabel, FieldMessage, getInputClass } from "./FormField";
import { removeWhitespace } from "../../utils/validation";

export interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  showToggle?: boolean;
  autoComplete?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  /** Element on the right of the label (e.g. "Forgot password?" link) */
  labelAction?: ReactNode;
}

/** Password field with lock icon, show/hide toggle. Whitespace is never allowed. */
export const PasswordInput = memo(function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  error,
  required = false,
  showToggle = true,
  autoComplete,
  name,
  id,
  disabled = false,
  className = "",
  labelAction,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const autoId = useId();
  const inputId = id || name || autoId;
  const isVisible = showToggle && showPassword;

  return (
    <div className={className}>
      <FormLabel htmlFor={inputId} label={label} required={required} action={labelAction} />

      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(removeWhitespace(e.target.value))}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={getInputClass({
            hasError: Boolean(error),
            hasLeftIcon: true,
            hasRightIcon: showToggle,
          })}
        />

        <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />

        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            disabled={disabled}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      <FieldMessage error={error} />
    </div>
  );
});

export default PasswordInput;
