import { useSelector } from "react-redux";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme, isDark, toggleTheme } = useTheme();

  const displayName = user?.name || "Guest User";
  const displayRole = user?.role || "Visitor";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200 ${
        isDark
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold tracking-tight">
          Productivity<span className="text-blue-500">Hub</span>
        </h2>
      </div>

      {/* Right Controls: Theme Toggle + User Profile */}
      <div className="flex items-center gap-4">
        {/* Context API Theme Toggle Button with Lucide Icons */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className={`p-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            isDark
              ? "bg-gray-800 text-amber-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
          <span className="text-xs hidden sm:inline capitalize font-semibold">
            {theme}
          </span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
          <div className="text-right hidden sm:block">
            <p
              className={`text-sm font-semibold leading-none ${
                isDark ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {displayName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{displayRole}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {userInitial}
          </div>
          {isAuthenticated && (
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900"
              title="Online"
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
