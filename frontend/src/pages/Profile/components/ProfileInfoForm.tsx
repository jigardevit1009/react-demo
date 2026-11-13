import { useState, useEffect, FormEvent } from "react";
import { User as UserIcon, Mail, Briefcase } from "lucide-react";
import Card from "../../../components/common/Card";
import Alert from "../../../components/common/Alert";
import FormInput from "../../../components/common/FormInput";
import FormActions from "../../../components/common/FormActions";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { updateUserProfile } from "../../../store/authSlice";
import { useUpdateProfileMutation, useGetMeQuery } from "../../../store/api/authApiSlice";
import { useSocket } from "../../../context/SocketContext";
import { getErrorMessage } from "../../../utils/error";
import { validateName, sanitizeText } from "../../../utils/validation";

/** "Account Details" tab: edit name, view email & role. */
export function ProfileInfoForm() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showNotification } = useSocket();
  const { data: profileData, refetch: refetchProfile } = useGetMeQuery();
  const [updateProfileApi, { isLoading }] = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || "");
  const [nameError, setNameError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setName(profileData?.data?.name || user?.name || "");
  }, [profileData, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const nameErr = validateName(name);
    if (nameErr) {
      setNameError(nameErr);
      return;
    }

    const trimmedName = name.trim();
    try {
      await updateProfileApi({ name: trimmedName }).unwrap();
      dispatch(updateUserProfile({ name: trimmedName })); // Redux + localStorage
      setSuccessMsg("Profile details updated successfully!");
      showNotification({
        title: "Profile Updated",
        message: `Your name is now set to "${trimmedName}".`,
        type: "success",
      });
      refetchProfile();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      setErrorMsg(getErrorMessage(err, "Failed to update profile."));
    }
  };

  return (
    <Card title="Account Details" subtitle="Update your visible name and workspace preferences">
      <div className="space-y-3 mb-6 empty:hidden">
        <Alert variant="success">{successMsg}</Alert>
        <Alert variant="error">{errorMsg}</Alert>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormInput
            label="Name"
            required
            icon={UserIcon}
            value={name}
            onChange={(e) => {
              setName(sanitizeText(e.target.value));
              if (nameError) setNameError("");
            }}
            placeholder="Enter your name"
            error={nameError}
            hint="This name is displayed across team task boards and comments."
          />
          <FormInput
            label="Email Address"
            type="email"
            icon={Mail}
            value={user?.email || ""}
            disabled
            hint="Email is locked as your primary workspace login credential."
          />
          <FormInput
            label="Role Title"
            icon={Briefcase}
            value={user?.role || "Software Developer"}
            disabled
            hint="Assigned by organization administrators."
          />
        </div>

        <FormActions
          isLoading={isLoading}
          submitLabel="Save Profile Details"
          loadingLabel="Saving Changes..."
        />
      </form>
    </Card>
  );
}

export default ProfileInfoForm;
