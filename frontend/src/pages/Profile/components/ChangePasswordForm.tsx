import { useState, FormEvent } from "react";
import Card from "../../../components/common/Card";
import Alert from "../../../components/common/Alert";
import PasswordInput from "../../../components/common/PasswordInput";
import NewPasswordFields from "../../../components/common/NewPasswordFields";
import FormActions from "../../../components/common/FormActions";
import { useChangePasswordMutation } from "../../../store/api/authApiSlice";
import { useSocket } from "../../../context/SocketContext";
import { getErrorMessage } from "../../../utils/error";
import { validatePasswordPair } from "../../../utils/validation";

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

/** "Change Password" tab: current + new + confirm in one grid row. */
export function ChangePasswordForm() {
  const { showNotification } = useSocket();
  const [changePasswordApi, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});

  /** Updates a field and clears its error. */
  const handleChange =
    (setter: (v: string) => void, field: keyof PasswordErrors) => (value: string) => {
      setter(value);
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const next: PasswordErrors = {};
    if (!currentPassword) next.currentPassword = "Current password is required.";
    const pairErrors = validatePasswordPair(newPassword, confirmPassword);
    if (pairErrors.password) next.newPassword = pairErrors.password;
    if (pairErrors.confirmPassword) next.confirmPassword = pairErrors.confirmPassword;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    try {
      await changePasswordApi({ currentPassword, newPassword }).unwrap();
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotification({
        title: "Security Update",
        message: "Your account password was updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Change password error:", err);
      const serverMsg = getErrorMessage(
        err,
        "Failed to change password. Please check your current password.",
      );
      setErrors(
        serverMsg.toLowerCase().includes("current password")
          ? { currentPassword: serverMsg }
          : { general: serverMsg },
      );
    }
  };

  return (
    <Card title="Change Password" subtitle="Ensure your account is protected with a secure password">
      <div className="space-y-3 mb-6 empty:hidden">
        <Alert variant="success">{successMsg}</Alert>
        <Alert variant="error">{errors.general}</Alert>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Same grid as the Profile tab: Current | New | Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <PasswordInput
            label="Current Password"
            required
            value={currentPassword}
            onChange={handleChange(setCurrentPassword, "currentPassword")}
            placeholder="Enter your current password"
            error={errors.currentPassword}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <NewPasswordFields
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={handleChange(setNewPassword, "newPassword")}
            onConfirmPasswordChange={handleChange(setConfirmPassword, "confirmPassword")}
            passwordError={errors.newPassword}
            confirmPasswordError={errors.confirmPassword}
            disabled={isLoading}
            className="contents"
          />
        </div>

        <FormActions
          isLoading={isLoading}
          submitLabel="Change Password"
          loadingLabel="Updating Password..."
        />
      </form>
    </Card>
  );
}

export default ChangePasswordForm;
