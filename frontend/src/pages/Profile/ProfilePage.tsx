import { useState, useEffect, FormEvent } from "react";
import {
  User as UserIcon,
  KeyRound,
  CheckCircle2,
  Briefcase,
  Mail,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PasswordInput from "../../components/common/PasswordInput";
import NewPasswordFields from "../../components/common/NewPasswordFields";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateUserProfile } from "../../store/authSlice";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} from "../../store/api/authApiSlice";
import { useSocket } from "../../context/SocketContext";
import { getErrorMessage } from "../../utils/error";
import { validatePasswordPair } from "../../utils/validation";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showNotification } = useSocket();

  // Fetch fresh profile from API
  const { data: profileData, refetch: refetchProfile } = useGetMeQuery();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [nameError, setNameError] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [updateProfileApi, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePasswordApi, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  useEffect(() => {
    if (profileData?.data) {
      setName(profileData.data.name || "");
    } else if (user) {
      setName(user.name || "");
    }
  }, [profileData, user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setNameError("");

    if (!name.trim()) {
      setNameError("Full name is required.");
      return;
    }

    try {
      await updateProfileApi({
        name: name.trim(),
      }).unwrap();

      // Update Redux state and persistent localStorage
      dispatch(updateUserProfile({ name: name.trim() }));

      setProfileSuccessMsg("Profile details updated successfully!");
      showNotification({
        title: "Profile Updated",
        message: `Your name is now set to "${name.trim()}".`,
        type: "success",
      });

      refetchProfile();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      setProfileErrorMsg(getErrorMessage(err, "Failed to update profile."));
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg("");
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    // Shared password validation logic
    const pwdPairErrors = validatePasswordPair(newPassword, confirmPassword);
    if (pwdPairErrors.password) errors.newPassword = pwdPairErrors.password;
    if (pwdPairErrors.confirmPassword) errors.confirmPassword = pwdPairErrors.confirmPassword;

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});

    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
      }).unwrap();

      setPasswordSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});

      showNotification({
        title: "Security Update",
        message: "Your account password was updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Change password error:", err);
      const serverMsg = getErrorMessage(
        err,
        "Failed to change password. Please check your current password."
      );
      if (serverMsg.toLowerCase().includes("current password")) {
        setPasswordErrors({ currentPassword: serverMsg });
      } else {
        setPasswordErrors({ general: serverMsg });
      }
    }
  };

  const userInitial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Profile Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner text-white">
              {userInitial}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900 shadow-sm"
              title="Active User"
            />
          </div>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name || "Workspace Member"}
            </h1>

            <p className="text-blue-100 text-sm flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-4 h-4 opacity-75" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "password"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Profile Information */}
      {activeTab === "profile" && (
        <Card
          title="Account Details"
          subtitle="Update your visible name and workspace preferences"
        >
          {profileSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
              {profileErrorMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="e.g. Jordan Bell"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 font-medium transition-colors ${
                      nameError
                        ? "border-rose-500 focus:ring-rose-500/30"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                </div>
                {nameError && (
                  <span className="text-xs text-rose-500 dark:text-rose-400 mt-1.5 block font-medium">
                    {nameError}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  This name is displayed across team task boards and comments.
                </p>
              </div>

              {/* Email Address (View-Only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-gray-100 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                  />
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Email is locked as your primary workspace login credential.
                </p>
              </div>

              {/* Role Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Role Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.role || "Software Developer"}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm bg-gray-100 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                  />
                  <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Assigned by organization administrators.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-6 py-2.5 justify-center"
              >
                {isUpdatingProfile ? "Saving Changes..." : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: Change Password (Using Reusable Password Components) */}
      {activeTab === "password" && (
        <Card
          title="Change Password"
          subtitle="Ensure your account is protected with a secure password"
        >
          {passwordSuccessMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrors.general && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
              {passwordErrors.general}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5 max-w-xl">
            {/* Reusable Current Password Field */}
            <PasswordInput
              label="Current Password"
              required
              value={currentPassword}
              onChange={(val) => {
                setCurrentPassword(val);
                if (passwordErrors.currentPassword) {
                  setPasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
                }
              }}
              placeholder="Enter current password"
              error={passwordErrors.currentPassword}
              disabled={isChangingPassword}
              autoComplete="current-password"
            />

            {/* Reusable New Password & Confirm Password Pair */}
            <NewPasswordFields
              password={newPassword}
              confirmPassword={confirmPassword}
              onPasswordChange={(val) => {
                setNewPassword(val);
                if (passwordErrors.newPassword) {
                  setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                }
              }}
              onConfirmPasswordChange={(val) => {
                setConfirmPassword(val);
                if (passwordErrors.confirmPassword) {
                  setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              passwordError={passwordErrors.newPassword}
              confirmPasswordError={passwordErrors.confirmPassword}
              disabled={isChangingPassword}
            />

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isChangingPassword}
                className="w-full sm:w-auto px-6 py-2.5 justify-center"
              >
                {isChangingPassword ? "Updating Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default ProfilePage;
