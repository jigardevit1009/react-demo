import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useTheme } from "../../context/ThemeContext";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "Employees", icon: "👥", path: "/employees" },
    { label: "Tasks", icon: "✅", path: "/tasks" },
  ];

  return (
    <aside
      className={`w-64 border-r sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-between p-4 transition-colors duration-200 ${
        isDark
          ? "bg-gray-900 border-gray-800 text-gray-200"
          : "bg-white border-gray-200 text-gray-700"
      }`}
    >
      {/* Navigation Links */}
      <nav className="space-y-1.5">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Navigation
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? isDark
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-blue-50 text-blue-700 font-semibold"
                  : isDark
                  ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Redux Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          isDark
            ? "bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-900/40"
            : "bg-red-50 text-red-700 hover:bg-red-100"
        }`}
      >
        <span className="text-base">🚪</span>
        <span>Logout (Redux)</span>
      </button>
    </aside>
  );
}

export default Sidebar;
