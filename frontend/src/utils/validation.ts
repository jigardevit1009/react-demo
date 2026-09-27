/**
 * Reusable Form Validation Helpers
 */

/**
 * Validates an email address format
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * Validates a standard password (required, min 6 characters)
 */
export function validatePassword(password: string, fieldName = "Password"): string | null {
  if (!password) {
    return `${fieldName} is required.`;
  }
  if (password.length < 6) {
    return `${fieldName} must be at least 6 characters.`;
  }
  return null;
}

/**
 * Validates a new password + confirm password pair
 */
export function validatePasswordPair(
  password: string,
  confirmPassword: string,
  passwordFieldName = "New password",
  confirmFieldName = "Confirm password"
): { password?: string; confirmPassword?: string } {
  const errors: { password?: string; confirmPassword?: string } = {};

  const pwdError = validatePassword(password, passwordFieldName);
  if (pwdError) {
    errors.password = pwdError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = `${confirmFieldName} is required.`;
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
