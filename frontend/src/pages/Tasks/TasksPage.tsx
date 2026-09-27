import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  RotateCw,
  Plus,
  Check,
  Undo2,
  Edit2,
  Trash2,
  Download,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PaginationBar from "../../components/common/PaginationBar";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { TaskStatusBadge, TaskPriorityBadge } from "../../components/common/TaskBadges";
import { useAppSelector } from "../../store/store";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  TasksResponse,
} from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery, EmployeesResponse } from "../../store/api/employeeApiSlice";
import { useExportReportMutation } from "../../store/api/reportApiSlice";
import { useSocket } from "../../context/SocketContext";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../utils/error";
import { formatDate } from "../../utils/date";
import { TaskFilterBar } from "./components/TaskFilterBar";
import { TaskFormModal, TaskFormData } from "./components/TaskFormModal";
import type { Task, Employee } from "../../types";

const ITEMS_PER_PAGE = 10;

function TasksPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.isSuperAdmin);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTasksQuery({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearchTerm,
      status: statusFilter,
      priority: priorityFilter,
      ...(!isAdmin && user?.id ? { assignee: user.id } : {}),
      ...(isAdmin && assigneeFilter !== "ALL" ? { assignee: assigneeFilter } : {}),
    });

  const { data: allEmployeesData } = useGetEmployeesQuery(
    { all: true },
    { skip: !isAdmin }
  );
  const employeeList: Employee[] = allEmployeesData
    ? Array.isArray(allEmployeesData)
      ? allEmployeesData
      : (allEmployeesData as EmployeesResponse).employees || []
    : [];

  const tasks: Task[] = data
    ? Array.isArray(data)
      ? data
      : (data as TasksResponse).tasks || []
    : [];

  const totalTasks = (data as TasksResponse)?.total ?? tasks.length;
  const totalPages =
    (data as TasksResponse)?.totalPages ??
    Math.ceil(totalTasks / ITEMS_PER_PAGE) ??
    1;

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [exportReport, { isLoading: isExporting }] = useExportReportMutation();
  const { showNotification } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [removingTask, setRemovingTask] = useState<Task | null>(null);

  const handleOpenAddModal = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleExportTasks = async () => {
    try {
      showNotification({
        title: "🐇 Task Export Queued (RabbitMQ)",
        message: "AMQP worker is compiling task records into a CSV report in the background...",
        type: "info",
      });
      await exportReport({ reportType: "TASKS_CSV" }).unwrap();
    } catch (err: unknown) {
      console.error("Failed to queue export job:", err);
      showNotification({
        title: "Export Failed",
        message: getErrorMessage(err, "Failed to trigger background task export."),
        type: "warning",
      });
    }
  };

  const handleModalSubmit = async (formData: TaskFormData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority?.toUpperCase(),
        status: formData.status?.toUpperCase()?.replace(/\s+/g, "_"),
        dueDate: formData.dueDate || null,
        assignedTo:
          !isAdmin && user?.id
            ? user.id
            : formData.assignee && formData.assignee !== "Unassigned"
            ? formData.assignee
            : null,
      };

      if (editingTask) {
        await updateTask({ id: editingTask.id, ...payload }).unwrap();
      } else {
        await createTask(payload).unwrap();
      }

      setIsModalOpen(false);
      setEditingTask(null);
      refetch();
    } catch (err: unknown) {
      console.error("Task submission error:", err);
      alert(getErrorMessage(err, "Failed to save task"));
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
        console.error("Failed to toggle status:", err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isAdmin ? "Task Management Board" : "My Assigned Tasks"}
            </h1>
            {!isAdmin && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                Personal View
              </span>
            )}
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* RabbitMQ AMQP Task Export Button */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportTasks}
            disabled={isExporting}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Download className={`w-3.5 h-3.5 text-emerald-600 ${isExporting ? "animate-bounce" : ""}`} />
            <span>{isExporting ? "Queuing Job..." : "Export Tasks (RabbitMQ)"}</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer flex items-center gap-1.5"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TaskFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        priorityFilter={priorityFilter}
        onPriorityChange={(val) => {
          setPriorityFilter(val);
          setCurrentPage(1);
        }}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={(val) => {
          setAssigneeFilter(val);
          setCurrentPage(1);
        }}
        isAdmin={isAdmin}
        currentUser={user}
        employeeList={employeeList}
      />

      {/* Task List Table */}
      <Card
        title="Active Deliverables"
        subtitle={
          isLoading
            ? "Loading tasks..."
            : `Showing page ${currentPage} of ${totalPages} (${totalTasks} total tasks)`
        }
      >
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
            <p className="text-sm font-medium">
              Loading tasks from database...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 space-y-2">
            <p className="font-semibold text-sm">Failed to connect to server</p>
            <p className="text-xs text-red-500 dark:text-red-400">
              {getErrorMessage(error, "Check backend connection")}
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No tasks found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try clearing filters or search terms.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setAssigneeFilter("ALL");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 min-w-[260px]">Title</th>
                  <th className="px-4 py-3 whitespace-nowrap">Assigned To</th>
                  <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Due Date</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/tasks/${task.id}`}
                        className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                          task.status === "COMPLETED" || task.status === "Completed"
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : ""
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
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={
                            task.status === "COMPLETED" || task.status === "Completed"
                              ? "secondary"
                              : "outline"
                          }
                          onClick={() => handleToggleComplete(task)}
                          className="inline-flex items-center gap-1"
                        >
                          {task.status === "COMPLETED" || task.status === "Completed" ? (
                            <>
                              <Undo2 className="w-3 h-3" />
                              <span>Undo</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(task)}
                          className="inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
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

        {/* Pagination Bar */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalTasks}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          isFetching={isFetching}
          itemLabel="tasks"
        />
      </Card>

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        isAdmin={isAdmin}
        currentUser={user}
        employeeList={employeeList}
        isLoading={isCreating || isUpdating}
      />

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

export default TasksPage;
