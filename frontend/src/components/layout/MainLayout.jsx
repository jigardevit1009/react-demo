import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";

function MainLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
