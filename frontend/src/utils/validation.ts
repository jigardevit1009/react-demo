/**
 * Reusable Form Validation Helpers
 */

/**
 * Input sanitizers (use inside onChange handlers)
 */

/** Text fields: blocks leading whitespace and collapses repeated spaces. */
export function sanitizeText(value: string): string {
  return value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
}

/** Fields that must never contain whitespace (email, password). */
export function removeWhitespace(value: string): string {
  return value.replace(/\s/g, "");
}

/**
 * Validates a required text field (rejects empty / whitespace-only input)
 */
export function validateRequiredText(
  value: string,
  fieldName: string,
  minLength = 2
): string | null {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }
  return null;
}

/**
 * Validates a title-like field (task title, job role, ...)
 *  - required, min / max length
 *  - must start with a letter or number
 *  - must contain at least 2 letters (rejects "1234", "@#$%", "23424@#2342424")
 *  - only common punctuation allowed: . , - _ : ; ( ) # & / ' " ! ? +
 */
export function validateTitle(
  value: string,
  fieldName = "Title",
  { minLength = 3, maxLength = 150 }: { minLength?: number; maxLength?: number } = {}
): string | null {
  const err = validateRequiredText(value, fieldName, minLength);
  if (err) return err;

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    return `${fieldName} cannot be longer than ${maxLength} characters.`;
  }
  if (!/^[A-Za-z0-9]/.test(trimmed)) {
    return `${fieldName} must start with a letter or number.`;
  }
  if ((trimmed.match(/[A-Za-z]/g) || []).length < 2) {
    return `${fieldName} must contain letters, not just numbers or symbols.`;
  }
  if (!/^[A-Za-z0-9 .,\-_:;()#&/'"!?+]+$/.test(trimmed)) {
    return `${fieldName} contains invalid characters. Only letters, numbers, spaces and . , - _ : ; ( ) # & / ' " ! ? + are allowed.`;
  }
  return null;
}

/**
 * Validates a person's name (letters, spaces, dots, apostrophes, hyphens)
 */
export function validateName(name: string, fieldName = "Full name"): string | null {
  const err = validateRequiredText(name, fieldName);
  if (err) return err;
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, dots, apostrophes and hyphens.`;
  }
  return null;
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  if (/\s/.test(email)) {
    return "Email address cannot contain spaces.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * Validates a standard password (required, min 6 characters, no spaces)
 */
export function validatePassword(password: string, fieldName = "Password"): string | null {
  if (!password) {
    return `${fieldName} is required.`;
  }
  if (/\s/.test(password)) {
    return `${fieldName} cannot contain spaces.`;
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
