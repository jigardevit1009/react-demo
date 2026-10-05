import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { useForgotPasswordMutation } from "../../store/api/authApiSlice";
import Button from "../../components/common/Button";
import NewPasswordFields from "../../components/common/NewPasswordFields";
import { validateEmail, validatePasswordPair } from "../../utils/validation";
import { getErrorMessage } from "../../utils/error";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [forgotPasswordApi, { isLoading }] = useForgotPasswordMutation();

  const validateForm = (): boolean => {
    const errors: {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

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
      const response = await forgotPasswordApi({
        email,
        newPassword,
      }).unwrap();

      setSuccessMessage(
        response?.message || "Password has been reset successfully! You can now log in."
      );
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      setGeneralError(
        getErrorMessage(err, "Password reset failed. Please check the email entered.")
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-3.5 sm:p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-8 transition-colors">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your account email and choose a new password
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300">
            {generalError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Password Reset Successful!</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </p>
            <Link to="/login">
              <Button variant="primary" size="sm" className="w-full mt-2">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-3.5 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              </div>
              {formErrors.email && (
                <span className="text-xs text-rose-600 dark:text-rose-400 mt-1 block font-medium">
                  {formErrors.email}
                </span>
              )}
            </div>

            {/* Reusable New Password & Confirm Password Fields */}
            <NewPasswordFields
              password={newPassword}
              confirmPassword={confirmPassword}
              onPasswordChange={(val) => {
                setNewPassword(val);
                if (formErrors.newPassword) {
                  setFormErrors((prev) => ({ ...prev, newPassword: undefined }));
                }
              }}
              onConfirmPasswordChange={(val) => {
                setConfirmPassword(val);
                if (formErrors.confirmPassword) {
                  setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              passwordError={formErrors.newPassword}
              confirmPasswordError={formErrors.confirmPassword}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 mt-2"
            >
              {isLoading ? "Updating Password..." : "Reset Password"}
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
