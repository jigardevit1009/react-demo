import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/store";
import { logout } from "../../store/authSlice";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

function Navbar({ isMobileMenuOpen = false, onToggleMobileMenu }: NavbarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme, isDark, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || "Guest User";
  const displayRole = user?.role || "Visitor";
  const userInitial = displayName.charAt(0).toUpperCase();
  const isAdmin = Boolean(user?.isSuperAdmin);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleNavigateToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className={`h-16 border-b px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 ${
        isDark
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden cursor-pointer"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <h2 className="text-lg font-bold tracking-tight select-none">
          Task<span className="text-blue-500">Track</span>
        </h2>
      </div>

      {/* Right Controls: Theme Toggle + User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
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

        {/* User Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          {/* Header Profile Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            title="Account Menu"
            className={`flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl border border-transparent transition-all cursor-pointer select-none ${
              isDropdownOpen
                ? isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-200"
                : isDark
                ? "hover:bg-gray-800/60"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-semibold leading-tight ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {displayName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{displayRole}</p>
            </div>

            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-500/20">
                {userInitial}
              </div>
              {isAuthenticated && (
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900"
                  title="Online"
                />
              )}
            </div>

            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu Modal / Popover */}
          {isDropdownOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                isDark
                  ? "bg-gray-900 border-gray-800 text-gray-100 divide-gray-800"
                  : "bg-white border-gray-200 text-gray-900 divide-gray-100"
              }`}
            >
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {user?.email || "No email available"}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-400/15 text-amber-500 border border-amber-400/30">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-400/15 text-blue-500 border border-blue-400/30">
                      <Briefcase className="w-3 h-3" />
                      {user?.role || "Team Member"}
                    </span>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1 space-y-1">
                <button
                  type="button"
                  onClick={handleNavigateToProfile}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isDark
                      ? "text-gray-200 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-blue-500" />
                  <span>My Profile</span>
                </button>
              </div>

              {/* Logout Option */}
              <div className="p-1 border-t border-gray-100 dark:border-gray-800 mt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isDark
                      ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
