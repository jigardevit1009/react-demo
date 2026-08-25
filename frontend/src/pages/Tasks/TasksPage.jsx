import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  RotateCw,
  Plus,
  Search,
  X,
  Check,
  Undo2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery } from "../../store/api/employeeApiSlice";
import { useDebounce } from "../../hooks/useDebounce";

const BLANK_TASK = {
  title: "",
  assignee: "Unassigned",
  priority: "Medium",
  status: "Pending",
  dueDate: "2026-08-26",
};

const ITEMS_PER_PAGE = 10;

// Static badge variant mapper helpers
const getPriorityVariant = (priority) => {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    default:
      return "info";
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "info";
    default:
      return "neutral";
  }
};

function TasksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTasksQuery({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearchTerm,
      status: statusFilter,
      priority: priorityFilter,
    });

  const { data: allEmployeesData } = useGetEmployeesQuery({ all: true });
  const employeeList = Array.isArray(allEmployeesData)
    ? allEmployeesData
    : allEmployeesData?.employees || [];

  const tasks = data?.tasks || (Array.isArray(data) ? data : []);
  const totalTasks = data?.total || tasks.length;
  const totalPages =
    data?.totalPages || Math.ceil(totalTasks / ITEMS_PER_PAGE) || 1;

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [formData, setFormData] = useState(BLANK_TASK);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Task title is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = useCallback(() => {
    setFormData(BLANK_TASK);
    setFormErrors({});
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assignee: task.assignee || "Unassigned",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      dueDate: task.dueDate || "2026-08-26",
    });
    setFormErrors({});
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createTask(formData).unwrap();
      setIsAddModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to create task:", err);
      setFormErrors({ general: err?.data?.message || "Failed to create task" });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateTask({ id: editingTask.id, ...formData }).unwrap();
      setEditingTask(null);
      refetch();
    } catch (err) {
      console.error("Failed to update task:", err);
      setFormErrors({ general: err?.data?.message || "Failed to update task" });
    }
  };

  const handleToggleComplete = useCallback(
    async (task) => {
      const newStatus =
        task.status === "Completed" ? "In Progress" : "Completed";
      try {
        await updateTask({ id: task.id, status: newStatus }).unwrap();
        refetch();
      } catch (err) {
        console.error("Failed to toggle status:", err);
      }
    },
    [updateTask, refetch]
  );

  const handleConfirmDelete = async () => {
    if (deletingTask) {
      try {
        await deleteTask(deletingTask.id).unwrap();
        setDeletingTask(null);
        refetch();
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Task Management Board
            </h1>
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, assign, and track project deliverables across the organization
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
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
            <p className="text-sm font-medium">Loading tasks from database...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 space-y-2">
            <p className="font-semibold text-sm">Failed to connect to server</p>
            <p className="text-xs text-red-500 dark:text-red-400">
              {error?.error || "Check backend connection"}
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
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        #{task.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/tasks/${task.id}`}
                        className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                          task.status === "Completed"
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : ""
                        }`}
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {task.assignee || "Unassigned"}
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
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {task.dueDate || "No deadline"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant={
                          task.status === "Completed" ? "secondary" : "outline"
                        }
                        onClick={() => handleToggleComplete(task)}
                        className="inline-flex items-center gap-1"
                      >
                        {task.status === "Completed" ? (
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1"
                        onClick={() => setDeletingTask(task)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{" "}
              to{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalTasks)}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                {totalTasks}
              </strong>{" "}
              entries
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isFetching}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage >= totalPages || isFetching}
                className="flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 1. ADD TASK MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Build JWT authentication guard"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.title
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              }`}
            />
            {formErrors.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To Employee
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Unassigned">Unassigned</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. EDIT TASK MODAL */}
      <Modal
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title={`Edit Task #${editingTask?.id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To Employee
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Unassigned">Unassigned</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingTask(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. DELETE TASK MODAL */}
      <Modal
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        title="Confirm Task Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to permanently delete task{" "}
            <strong className="text-gray-900 dark:text-white">
              {deletingTask?.title}
            </strong>
            ?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="secondary" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TasksPage;
