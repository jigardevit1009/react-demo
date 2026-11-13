import { Link } from "react-router-dom";
import { Check, Undo2, Edit2, Trash2 } from "lucide-react";
import IconButton from "../common/IconButton";
import { TaskStatusBadge, TaskPriorityBadge } from "../common/TaskBadges";
import { formatDate } from "../../utils/date";
import { isTaskCompleted } from "../../utils/task";
import type { Task } from "../../types";

interface TaskTableProps {
  tasks: Task[];
  showDueDate?: boolean;
  onToggleComplete: (task: Task) => void;
  /** Omit to hide the Edit action */
  onEdit?: (task: Task) => void;
  /** Omit to hide the Remove action (e.g. non-admin users) */
  onRemove?: (task: Task) => void;
}

const TH = "px-4 py-3 whitespace-nowrap";

/** Task list table shared by the Dashboard and Tasks pages. */
export function TaskTable({
  tasks,
  showDueDate = false,
  onToggleComplete,
  onEdit,
  onRemove,
}: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
        <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-3 min-w-[260px]">Title</th>
            <th className={TH}>Assigned To</th>
            <th className={TH}>Priority</th>
            <th className={TH}>Status</th>
            {showDueDate && <th className={TH}>Due Date</th>}
            <th className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map((task) => {
            const completed = isTaskCompleted(task.status);
            return (
              <tr
                key={task.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  <Link
                    to={`/tasks/${task.id}`}
                    className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                      completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  {task.employee?.name || task.assignee || "Unassigned"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <TaskPriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <TaskStatusBadge status={task.status} />
                </td>
                {showDueDate && (
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(task.dueDate)}
                  </td>
                )}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconButton
                      icon={completed ? Undo2 : Check}
                      label={completed ? "Mark as not done" : "Mark as done"}
                      tone="success"
                      onClick={() => onToggleComplete(task)}
                    />
                    {onEdit && (
                      <IconButton
                        icon={Edit2}
                        label="Edit task"
                        tone="primary"
                        onClick={() => onEdit(task)}
                      />
                    )}
                    {onRemove && (
                      <IconButton
                        icon={Trash2}
                        label="Remove task"
                        tone="danger"
                        onClick={() => onRemove(task)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;
