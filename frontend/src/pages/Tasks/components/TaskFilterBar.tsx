import SearchInput from "../../../components/common/SearchInput";
import FormSelect, { SelectOption } from "../../../components/common/FormSelect";
import type { Employee, User } from "../../../types";

export interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  assignee: string;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  assignee: "ALL",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "TODO", label: "To Do" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All Priorities" },
  { value: "High", label: "High Priority" },
  { value: "Medium", label: "Medium Priority" },
  { value: "Low", label: "Low Priority" },
];

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (changes: Partial<TaskFilters>) => void;
  isAdmin: boolean;
  currentUser: User | null;
  employeeList: Employee[];
}

export function TaskFilterBar({
  filters,
  onChange,
  isAdmin,
  currentUser,
  employeeList,
}: TaskFilterBarProps) {
  const assigneeOptions: SelectOption[] = [
    { value: "ALL", label: "All Assignees" },
    { value: "UNASSIGNED", label: "Unassigned" },
    ...employeeList.map((emp) => ({ value: emp.id, label: `${emp.name} (${emp.role})` })),
  ];

  return (
    <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center md:justify-end">
      <SearchInput
        value={filters.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search tasks by title"
        className="w-full md:w-64"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 md:flex items-center gap-2.5 w-full md:w-auto">
        {isAdmin ? (
          <FormSelect
            aria-label="Filter by assignee"
            value={filters.assignee}
            onChange={(e) => onChange({ assignee: e.target.value })}
            options={assigneeOptions}
            className="w-full md:w-auto md:max-w-48"
          />
        ) : (
          <div className="flex items-center justify-center sm:justify-start px-3 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs font-medium">
            Assignee:&nbsp;<strong>{currentUser?.name || "You"}</strong>
          </div>
        )}

        <FormSelect
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          options={STATUS_OPTIONS}
          className="w-full md:w-auto"
        />

        <FormSelect
          aria-label="Filter by priority"
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
          options={PRIORITY_OPTIONS}
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}

export default TaskFilterBar;
