export const STATUS_TABS = ["ALL", "TODO", "IN PROGRESS", "PENDING", "COMPLETED"] as const;

interface StatusFilterTabsProps {
  value: string;
  onChange: (status: string) => void;
}

/** Segmented control for filtering tasks by status. */
export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex xl:justify-end overflow-x-auto">
      <div
        role="group"
        aria-label="Filter tasks by status"
        className="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/70"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            aria-pressed={value === tab}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
              value === tab
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StatusFilterTabs;
