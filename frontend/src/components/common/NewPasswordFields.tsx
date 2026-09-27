import { memo } from "react";
import PasswordInput from "./PasswordInput";

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
}

export const NewPasswordFields = memo(function NewPasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  passwordError,
  confirmPasswordError,
  passwordLabel = "New Password (min. 6 characters)",
  confirmPasswordLabel = "Confirm New Password",
  passwordPlaceholder = "Enter new strong password",
  confirmPasswordPlaceholder = "Repeat new password",
  showConfirmToggle = false,
  disabled = false,
}: NewPasswordFieldsProps) {
  return (
    <div className="space-y-5">
      {/* 1. New Password Field */}
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
