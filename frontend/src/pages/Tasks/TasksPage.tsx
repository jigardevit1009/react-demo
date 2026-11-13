import { useState, useCallback } from "react";
import { Plus, Download } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import PaginationBar from "../../components/common/PaginationBar";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/DataState";
import TaskTable from "../../components/tasks/TaskTable";
import { useAppSelector } from "../../store/store";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  TasksResponse,
} from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery } from "../../store/api/employeeApiSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { useTaskActions } from "../../hooks/useTaskActions";
import { useExportReport } from "../../hooks/useExportReport";
import { getErrorMessage } from "../../utils/error";
import { toTaskList } from "../../utils/task";
import { toEmployeeList } from "../../utils/employee";
import { TaskFilterBar, TaskFilters, DEFAULT_TASK_FILTERS } from "./components/TaskFilterBar";
import { TaskFormModal, TaskFormData } from "./components/TaskFormModal";
import type { Task } from "../../types";

const ITEMS_PER_PAGE = 10;

function TasksPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.isSuperAdmin);

  // ---- Filters & pagination ----
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const debouncedSearch = useDebounce<string>(filters.search, 400);

  const updateFilters = (changes: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setCurrentPage(1);
  };

  // ---- Data ----
  const { data, isLoading, isFetching, isError, error, refetch } = useGetTasksQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: filters.status,
    priority: filters.priority,
    ...(!isAdmin && user?.id ? { assignee: user.id } : {}),
    ...(isAdmin && filters.assignee !== "ALL" ? { assignee: filters.assignee } : {}),
  });
  const { data: allEmployeesData } = useGetEmployeesQuery({ all: true }, { skip: !isAdmin });

  const tasks = toTaskList(data);
  const employeeList = toEmployeeList(allEmployeesData);
  const totalTasks = (data as TasksResponse)?.total ?? tasks.length;
  const totalPages =
    (data as TasksResponse)?.totalPages ?? Math.ceil(totalTasks / ITEMS_PER_PAGE) ?? 1;

  // ---- Actions ----
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { toggleComplete, removingTask, requestRemove, cancelRemove, confirmRemove, isDeleting } =
    useTaskActions(refetch);
  const { runExport, isExporting } = useExportReport();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openModal = useCallback((task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleExportTasks = () =>
    runExport({
      params: { reportType: "TASKS_CSV" },
      queuedTitle: "Task Export Started",
      queuedMessage: "Your task report is being prepared. We'll notify you when it's ready to download.",
      failureMessage: "Failed to trigger background task export.",
    });

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
      closeModal();
      refetch();
    } catch (err: unknown) {
      console.error("Task submission error:", err);
      alert(getErrorMessage(err, "Failed to save task"));
    }
  };

  // ---- Render ----
  const renderTableContent = () => {
    if (isLoading) return <LoadingState message="Loading tasks..." />;
    if (isError) {
      return (
        <ErrorState
          title="Failed to connect to server"
          message={getErrorMessage(error, "Check backend connection")}
        />
      );
    }
    if (tasks.length === 0) {
      return (
        <EmptyState
          title="No tasks found"
          message="Try clearing filters or search terms."
          actionLabel="Reset Filters"
          onAction={() => updateFilters(DEFAULT_TASK_FILTERS)}
        />
      );
    }
    return (
      <TaskTable
        tasks={tasks}
        showDueDate
        onToggleComplete={toggleComplete}
        onEdit={openModal}
        onRemove={isAdmin ? requestRemove : undefined}
      />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Task Management Board" : "My Assigned Tasks"}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleExportTasks}
              disabled={isExporting}
              className="gap-1.5 flex-1 sm:flex-initial"
            >
              <Download
                className={`w-3.5 h-3.5 text-emerald-600 shrink-0 ${isExporting ? "animate-bounce" : ""}`}
              />
              <span>{isExporting ? "Queuing Job..." : "Export Tasks"}</span>
            </Button>
            <Button variant="primary" onClick={() => openModal()} className="gap-1.5 w-full sm:w-auto">
              <Plus className="w-4 h-4 shrink-0" />
              <span>Create Task</span>
            </Button>
          </>
        }
      />

      <Card
        title="Active Deliverables"
        subtitle={
          isLoading
            ? "Loading tasks..."
            : `Showing page ${currentPage} of ${totalPages} (${totalTasks} total tasks)`
        }
        headerActions={
          <TaskFilterBar
            filters={filters}
            onChange={updateFilters}
            isAdmin={isAdmin}
            currentUser={user}
            employeeList={employeeList}
          />
        }
      >
        {renderTableContent()}
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

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        isAdmin={isAdmin}
        currentUser={user}
        employeeList={employeeList}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDeleteModal
        isOpen={removingTask !== null}
        onClose={cancelRemove}
        onConfirm={confirmRemove}
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
