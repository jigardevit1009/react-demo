import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import MetricCard from "../Dashboard/MetricCard";
import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery } from "../../store/api/employeeApiSlice";

function DashboardPage() {
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isFetching,
    refetch,
  } = useGetTasksQuery({ all: true });
  const { data: employeesData } = useGetEmployeesQuery({ all: true });

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || [];
  const employees = Array.isArray(employeesData)
    ? employeesData
    : employeesData?.employees || [];

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [filter, setFilter] = useState("ALL");

  // Recalculate derived metrics
  const metrics = useMemo(() => {
    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "In Progress",
    ).length;
    const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
    const productivityScore =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalEmployees,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      productivityScore,
    };
  }, [tasks, employees]);

  // Filtered recent tasks (first 10 for dashboard)
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (filter !== "ALL") {
      list = tasks.filter(
        (task) => task.status?.toUpperCase() === filter.toUpperCase(),
      );
    }
    return list.slice(0, 10);
  }, [tasks, filter]);

  const handleToggleComplete = useCallback(
    async (task) => {
      const newStatus =
        task.status === "Completed" ? "In Progress" : "Completed";
      try {
        await updateTask({ id: task.id, status: newStatus }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    [updateTask, refetch],
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      try {
        await deleteTask(taskId).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    },
    [deleteTask, refetch],
  );

  const getPriorityVariant = useCallback((priority) => {
    switch (priority) {
      case "High":
        return "danger";
      case "Medium":
        return "warning";
      default:
        return "info";
    }
  }, []);

  const getStatusVariant = useCallback((status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "info";
      default:
        return "neutral";
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Dashboard Overview
            </h1>
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tasks">
            <Button variant="primary" size="md">
              + Manage Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Employees"
          value={metrics.totalEmployees}
          badge="Directory"
          badgeColor="text-emerald-600"
          subtitle="Active team members"
        />

        <MetricCard
          title="Active Tasks"
          value={metrics.inProgressTasks}
          badge="In Progress"
          badgeColor="text-blue-600"
          subtitle={`${metrics.pendingTasks} awaiting start`}
        />

        <MetricCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          badge="Delivered"
          badgeColor="text-emerald-600"
          subtitle="Total completed"
        />

        <MetricCard
          title="Productivity Rate"
          value={`${metrics.productivityScore}%`}
          badge="Target: 80%"
          badgeColor="text-purple-600"
          subtitle="Overall completion rate"
          progress={metrics.productivityScore}
          progressColor="bg-purple-600"
        />
      </div>

      {/* Tasks Table */}
      <Card
        title="Recent Team Deliverables"
        subtitle={
          isTasksLoading
            ? "Loading..."
            : `Showing top ${filteredTasks.length} recent tasks`
        }
        badge={`${filteredTasks.length} shown`}
      >
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <span className="text-xs font-semibold text-gray-400 mr-2 uppercase">
            Filter:
          </span>
          {["ALL", "IN PROGRESS", "PENDING", "COMPLETED"].map((tab) => (
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
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        #{task.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <span
                        className={
                          task.status === "Completed"
                            ? "line-through text-gray-400"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {task.assignee}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant={
                          task.status === "Completed" ? "secondary" : "outline"
                        }
                        onClick={() => handleToggleComplete(task)}
                      >
                        {task.status === "Completed" ? "Undo" : "✓ Done"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardPage;
