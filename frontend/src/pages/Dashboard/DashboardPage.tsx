import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { TaskStatusBadge, TaskPriorityBadge } from "../../components/common/TaskBadges";
import MetricCard from "./MetricCard";
import { useAppSelector } from "../../store/store";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  TasksResponse,
} from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery, EmployeesResponse } from "../../store/api/employeeApiSlice";
import { useExportReportMutation } from "../../store/api/reportApiSlice";
import { useSocket } from "../../context/SocketContext";
import { Trash2, Download } from "lucide-react";
import { getErrorMessage } from "../../utils/error";
import type { Task, Employee } from "../../types";

function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.isSuperAdmin);

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isFetching,
    refetch,
  } = useGetTasksQuery({
    all: true,
    ...(!isAdmin && user?.id ? { assignee: user.id } : {}),
  });
  const { data: employeesData } = useGetEmployeesQuery(
    { all: true },
    { skip: !isAdmin },
  );

  const tasks: Task[] = useMemo(() => {
    if (!tasksData) return [];
    if (Array.isArray(tasksData)) return tasksData;
    return (tasksData as TasksResponse).tasks || [];
  }, [tasksData]);

  const employees: Employee[] = useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    return (employeesData as EmployeesResponse).employees || [];
  }, [employeesData]);

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [exportReport, { isLoading: isExporting }] = useExportReportMutation();
  const { isConnected, showNotification } = useSocket();

  const [filter, setFilter] = useState<string>("ALL");
  const [removingTask, setRemovingTask] = useState<Task | null>(null);

  // Recalculate derived metrics (compatible with both uppercase ENUM and Title Case)
  const metrics = useMemo(() => {
    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === "COMPLETED" || t.status === "Completed",
    ).length;
    const activeTasks = tasks.filter(
      (t) => t.status !== "COMPLETED" && t.status !== "Completed",
    ).length;
    const productivityScore =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalEmployees,
      totalTasks,
      completedTasks,
      activeTasks,
      productivityScore,
    };
  }, [tasks, employees]);

  // Filtered recent tasks (first 10 for dashboard)
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (filter !== "ALL") {
      list = tasks.filter(
        (task) =>
          task.status?.toUpperCase()?.replace(/\s+/g, "_") ===
          filter.toUpperCase().replace(/\s+/g, "_"),
      );
    }
    return list.slice(0, 10);
  }, [tasks, filter]);

  const handleExportReport = async () => {
    try {
      showNotification({
        title: "🐇 Job Queued in RabbitMQ!",
        message:
          "Asynchronous worker is compiling 500+ records in the background...",
        type: "info",
      });
      await exportReport().unwrap();
    } catch (err: unknown) {
      console.error("Failed to queue export job:", err);
      showNotification({
        title: "Export Failed",
        message: getErrorMessage(err, "Failed to trigger report export."),
        type: "warning",
      });
    }
  };

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      const isCurrentlyCompleted =
        task.status === "COMPLETED" || task.status === "Completed";
      const newStatus = isCurrentlyCompleted ? "TODO" : "COMPLETED";
      try {
        await updateTask({ id: task.id, status: newStatus }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    [updateTask, refetch],
  );

  const handleConfirmRemove = async () => {
    if (removingTask) {
      try {
        await deleteTask(removingTask.id).unwrap();
        setRemovingTask(null);
        refetch();
      } catch (err) {
        console.error("Failed to remove task:", err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isAdmin ? "Dashboard Overview" : "My Workspace Dashboard"}
            </h1>
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isConnected
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                }`}
              />
              {isConnected ? "Socket.IO Live" : "Connecting..."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* RabbitMQ Asynchronous Export Button (Admin Only) */}
          {isAdmin && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              {isExporting ? "Queuing Job..." : "Export Report (RabbitMQ)"}
            </Button>
          )}

          <Link to="/tasks">
            <Button variant="primary" size="md">
              + Manage Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isAdmin ? (
          <MetricCard
            title="Total Employees"
            value={metrics.totalEmployees}
            badge="Directory"
            badgeColor="text-emerald-600"
            subtitle="Active team members"
          />
        ) : (
          <MetricCard
            title="Assigned Tasks"
            value={metrics.totalTasks}
            badge="My Deliverables"
            badgeColor="text-indigo-600"
            subtitle="Total tasks assigned to you"
          />
        )}

        <MetricCard
          title="Active Tasks"
          value={metrics.activeTasks}
          badge="Active"
          badgeColor="text-blue-600"
          subtitle={
            isAdmin ? "Tasks awaiting completion" : "Your open deliverables"
          }
        />

        <MetricCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          badge="Delivered"
          badgeColor="text-emerald-600"
          subtitle={isAdmin ? "Total completed" : "Completed by you"}
        />

        <MetricCard
          title="Productivity Rate"
          value={`${metrics.productivityScore}%`}
          badge={isAdmin ? "Target: 80%" : "My Rate"}
          badgeColor="text-purple-600"
          subtitle={
            isAdmin ? "Overall completion rate" : "Your completion rate"
          }
          progress={metrics.productivityScore}
          progressColor="bg-purple-600"
        />
      </div>

      {/* Tasks Table */}
      <Card
        title={
          isAdmin ? "Recent Team Deliverables" : "Your Recent Deliverables"
        }
        subtitle={
          isTasksLoading
            ? "Loading..."
            : `Showing top ${filteredTasks.length} ${isAdmin ? "recent tasks" : "tasks assigned to you"}`
        }
        badge={`${filteredTasks.length} shown`}
      >
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <span className="text-xs font-semibold text-gray-400 mr-2 uppercase">
            Filter:
          </span>
          {["ALL", "TODO", "IN PROGRESS", "PENDING", "COMPLETED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isTasksLoading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
            <p className="text-sm mt-2">Loading tasks from database...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No tasks found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              No tasks matching "{filter}".
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setFilter("ALL")}
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 min-w-[240px]">Title</th>
                  <th className="px-4 py-3 whitespace-nowrap">Assignee</th>
                  <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/tasks/${task.id}`}
                        className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                          task.status === "COMPLETED" ||
                          task.status === "Completed"
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : ""
                        }`}
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>
                          {task.employee?.name || task.assignee || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={
                            task.status === "COMPLETED" ||
                            task.status === "Completed"
                              ? "secondary"
                              : "outline"
                          }
                          onClick={() => handleToggleComplete(task)}
                        >
                          {task.status === "COMPLETED" ||
                          task.status === "Completed"
                            ? "Undo"
                            : "✓ Done"}
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1"
                            onClick={() => setRemovingTask(task)}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Remove Task Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={removingTask !== null}
        onClose={() => setRemovingTask(null)}
        onConfirm={handleConfirmRemove}
        title="Confirm Task Removal"
        itemType="task"
        itemName={removingTask?.title}
        isLoading={isDeleting}
        confirmButtonText="Remove Task"
      />
    </div>
  );
}

export default DashboardPage;
