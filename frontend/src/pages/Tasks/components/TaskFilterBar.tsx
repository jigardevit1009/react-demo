import { ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import Card from "../../../components/common/Card";
import type { Employee, User } from "../../../types";

interface TaskFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (assignee: string) => void;
  isAdmin: boolean;
  currentUser: User | null;
  employeeList: Employee[];
}

export function TaskFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  isAdmin,
  currentUser,
  employeeList,
}: TaskFilterBarProps) {
  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {isAdmin ? (
            <select
              value={assigneeFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onAssigneeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs font-medium">
              <span>
                Assignee: <strong>{currentUser?.name || "You"}</strong>
              </span>
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onPriorityChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

export default TaskFilterBar;
