import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the Context object
const ThemeContext = createContext();

// 2. Create the Provider Component
export function ThemeProvider({ children }) {
  // Read initial theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app_theme");
    return savedTheme || "light";
  });

  // Whenever theme changes, update localStorage and HTML class list
  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom Hook to easily consume ThemeContext
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
