import { useTheme } from "../../context/ThemeContext";

function Card({ title, subtitle, badge, children, className = "" }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-xl border shadow-xs p-6 transition-colors duration-200 ${
        isDark
          ? "bg-gray-900 border-gray-800 text-gray-100"
          : "bg-white border-gray-200 text-gray-900"
      } ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div>
            {title && (
              <h3
                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

export default Card;
