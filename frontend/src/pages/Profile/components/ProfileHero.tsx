import { Mail } from "lucide-react";
import type { User } from "../../../types";

interface ProfileHeroProps {
  user: User | null;
}

/** Gradient banner with avatar initial, name and email. */
export function ProfileHero({ user }: ProfileHeroProps) {
  const userInitial = (user?.name || "U").charAt(0).toUpperCase();

  return (
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
  );
}

export default ProfileHero;
