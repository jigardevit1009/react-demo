import { useState } from "react";
import { useAppSelector } from "../../store/store";
import ProfileHero from "./components/ProfileHero";
import ProfileTabs, { ProfileTab } from "./components/ProfileTabs";
import ProfileInfoForm from "./components/ProfileInfoForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

export function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  return (
    <div className="space-y-6">
      <ProfileHero user={user} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "profile" ? <ProfileInfoForm /> : <ChangePasswordForm />}
    </div>
  );
}

export default ProfilePage;
