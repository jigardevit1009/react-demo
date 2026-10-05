import { ReactNode, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from "../../context/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
