import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CheckSquare, X, LucideIcon } from "lucide-react";
import { useAppSelector } from "../../store/store";
import { useTheme } from "../../context/ThemeContext";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const { isDark } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.isSuperAdmin);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenMobile) {
        onCloseMobile?.();
      }
    };
    if (isOpenMobile) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling when mobile sidebar is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpenMobile, onCloseMobile]);

  const menuItems: MenuItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ...(isAdmin ? [{ label: "Employees", icon: Users, path: "/employees" }] : []),
    { label: "Tasks", icon: CheckSquare, path: "/tasks" },
  ];

  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Navigation
      </p>
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isOpenMobile) onCloseMobile?.();
            }}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? isDark
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-blue-50 text-blue-700 font-semibold"
                  : isDark
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Hidden on mobile < md) */}
      <aside
        className={`hidden md:flex w-64 border-r sticky top-16 h-[calc(100vh-4rem)] flex-col justify-between p-4 shrink-0 transition-colors duration-200 ${
          isDark
            ? "bg-gray-900 border-gray-800 text-gray-200"
            : "bg-white border-gray-200 text-gray-700"
        }`}
      >
        {renderNavLinks()}
      </aside>

      {/* 2. Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 dark:bg-black/75 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Slide-Over Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] h-full flex flex-col justify-between p-4 shadow-2xl md:hidden transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full pointer-events-none"
        } ${
          isDark
            ? "bg-gray-900 border-r border-gray-800 text-gray-200"
            : "bg-white border-r border-gray-200 text-gray-700"
        }`}
        aria-label="Mobile Navigation"
      >
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold tracking-tight">
              Task<span className="text-blue-500">Track</span>
            </h2>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          {renderNavLinks()}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
