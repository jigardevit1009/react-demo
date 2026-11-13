import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { useForgotPasswordMutation } from "../../store/api/authApiSlice";
import AuthLayout from "../../components/layout/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import FormInput from "../../components/common/FormInput";
import NewPasswordFields from "../../components/common/NewPasswordFields";
import { validateEmail, validatePasswordPair, removeWhitespace } from "../../utils/validation";
import { getErrorMessage } from "../../utils/error";

interface ResetErrors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<ResetErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();

  /** Updates a field and clears its error. */
  const handleChange = (setter: (v: string) => void, field: keyof ResetErrors) => (value: string) => {
    setter(value);
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: ResetErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const pwdErrors = validatePasswordPair(newPassword, confirmPassword);
    if (pwdErrors.password) errors.newPassword = pwdErrors.password;
    if (pwdErrors.confirmPassword) errors.confirmPassword = pwdErrors.confirmPassword;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    if (!validateForm()) return;

    try {
      const response = await forgotPasswordApi({ email: email.trim(), newPassword }).unwrap();
      setSuccessMessage(
        response?.message || "Password has been reset successfully! You can now log in.",
      );
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      setGeneralError(getErrorMessage(err, "Password reset failed. Please check the email entered."));
    }
  };

  return (
    <AuthLayout
      header={
        <>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your account email and choose a new password
          </p>
        </>
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      }
    >
      <Alert variant="error" className="mb-4">
        {generalError}
      </Alert>

      {successMessage ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Password Reset Successful!</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          <Link to="/login">
            <Button variant="primary" size="sm" className="w-full mt-2">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          <FormInput
            label="Email"
            required
            type="email"
            icon={Mail}
            autoComplete="email"
            value={email}
            onChange={(e) => handleChange(setEmail, "email")(removeWhitespace(e.target.value))}
            placeholder="Enter your registered email address"
            error={formErrors.email}
          />

          <NewPasswordFields
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={handleChange(setNewPassword, "newPassword")}
            onConfirmPasswordChange={handleChange(setConfirmPassword, "confirmPassword")}
            passwordError={formErrors.newPassword}
            confirmPasswordError={formErrors.confirmPassword}
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full py-2.5 mt-2">
            {isLoading ? "Updating Password..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
