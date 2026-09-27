import { useState, ChangeEvent, memo } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

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
}

export const PasswordInput = memo(function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  error,
  required = false,
  showToggle = true,
  autoComplete,
  name,
  id,
  disabled = false,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const isVisible = showToggle && showPassword;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id || name}
        className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          id={id || name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full pl-10 ${
            showToggle ? "pr-10" : "pr-4"
          } py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? "border-rose-500 focus:ring-rose-500/30"
              : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
          }`}
        />

        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />

        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            disabled={disabled}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer focus:outline-none transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-rose-500 dark:text-rose-400 mt-1 block font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

export default PasswordInput;
