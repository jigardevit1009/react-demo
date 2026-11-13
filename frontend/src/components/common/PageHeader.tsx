import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Small badge(s) next to the title */
  badges?: ReactNode;
  /** Buttons on the right */
  actions?: ReactNode;
}

/** Page title row with optional badges and action buttons. */
export function PageHeader({ title, badges, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {badges}
      </div>
      {actions && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
