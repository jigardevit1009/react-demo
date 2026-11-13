import { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

interface CardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  /** Optional content rendered on the right side of the header (e.g. filters) */
  headerActions?: ReactNode;
}

function Card({ title, subtitle, children, className = "", headerActions }: CardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-xl border shadow-xs p-4 sm:p-6 transition-colors duration-200 ${
        isDark
          ? "bg-gray-900 border-gray-800 text-gray-100"
          : "bg-white border-gray-200 text-gray-900"
      } ${className}`}
    >
      {title && (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="shrink-0">
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
          {headerActions && <div className="w-full xl:w-auto min-w-0">{headerActions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

export default Card;
