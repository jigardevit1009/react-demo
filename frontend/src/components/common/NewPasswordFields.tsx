import { memo } from "react";
import PasswordInput from "./PasswordInput";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

export interface NewPasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  passwordError?: string;
  confirmPasswordError?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
  showConfirmToggle?: boolean;
  disabled?: boolean;
  showStrength?: boolean;
  /**
   * Container classes. Default stacks the two fields vertically.
   * Pass "contents" to let both fields become items of a parent grid.
   */
  className?: string;
}

export const NewPasswordFields = memo(function NewPasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordError,
  confirmPasswordError,
  passwordLabel = "New Password",
  confirmPasswordLabel = "Confirm New Password",
  passwordPlaceholder = "Enter a new password (min. 6 characters)",
  confirmPasswordPlaceholder = "Re-enter your new password",
  showConfirmToggle = false,
  disabled = false,
  showStrength = true,
  className = "space-y-4",
}: NewPasswordFieldsProps) {
  return (
    <div className={className}>
      {/* 1. New Password Field */}
      <div>
        <PasswordInput
          label={passwordLabel}
          required
          value={password}
          onChange={onPasswordChange}
          placeholder={passwordPlaceholder}
          error={passwordError}
          showToggle={true}
          autoComplete="new-password"
          disabled={disabled}
        />
        {showStrength && (
          <PasswordStrengthMeter password={password} showRules={true} />
        )}
      </div>

      {/* 2. Confirm Password Field */}
      <PasswordInput
        label={confirmPasswordLabel}
        required
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        placeholder={confirmPasswordPlaceholder}
        error={confirmPasswordError}
        showToggle={showConfirmToggle}
        autoComplete="new-password"
        disabled={disabled}
      />
    </div>
  );
});

export default NewPasswordFields;
