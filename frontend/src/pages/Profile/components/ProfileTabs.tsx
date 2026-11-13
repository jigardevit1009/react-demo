import { User as UserIcon, KeyRound, type LucideIcon } from "lucide-react";

export type ProfileTab = "profile" | "password";

const TABS: { id: ProfileTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile Information", icon: UserIcon },
  { id: "password", label: "Change Password", icon: KeyRound },
];

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div
      role="tablist"
      className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto py-1"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeTab === id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === id
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default ProfileTabs;
