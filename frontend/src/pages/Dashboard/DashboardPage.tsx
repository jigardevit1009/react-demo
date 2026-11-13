import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { LoadingState, EmptyState } from "../../components/common/DataState";
import TaskTable from "../../components/tasks/TaskTable";
import { useAppSelector } from "../../store/store";
import { useGetTasksQuery } from "../../store/api/taskApiSlice";
import { useGetEmployeesQuery } from "../../store/api/employeeApiSlice";
import { useTaskActions } from "../../hooks/useTaskActions";
import { useExportReport } from "../../hooks/useExportReport";
import { toTaskList, isTaskCompleted, normalizeStatus } from "../../utils/task";
import { toEmployeeList } from "../../utils/employee";
import DashboardMetrics from "./components/DashboardMetrics";
import StatusFilterTabs from "./components/StatusFilterTabs";

const RECENT_TASK_LIMIT = 10;

function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = Boolean(user?.isSuperAdmin);

  // ---- Data ----
  const { data: tasksData, isLoading: isTasksLoading, refetch } = useGetTasksQuery({
    all: true,
    ...(!isAdmin && user?.id ? { assignee: user.id } : {}),
  });
  const { data: employeesData } = useGetEmployeesQuery({ all: true }, { skip: !isAdmin });

  const tasks = useMemo(() => toTaskList(tasksData), [tasksData]);
  const employees = useMemo(() => toEmployeeList(employeesData), [employeesData]);

  // ---- Actions ----
  const { toggleComplete, removingTask, requestRemove, cancelRemove, confirmRemove, isDeleting } =
    useTaskActions(refetch);
  const { runExport, isExporting } = useExportReport();
  const [filter, setFilter] = useState<string>("ALL");

  const metrics = useMemo(() => {
    const completedTasks = tasks.filter((t) => isTaskCompleted(t.status)).length;
    return {
      totalEmployees: employees.length,
      totalTasks: tasks.length,
      completedTasks,
      activeTasks: tasks.length - completedTasks,
      productivityScore: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
    };
  }, [tasks, employees]);

  const filteredTasks = useMemo(() => {
    const list =
      filter === "ALL"
        ? tasks
        : tasks.filter((t) => normalizeStatus(t.status) === normalizeStatus(filter));
    return list.slice(0, RECENT_TASK_LIMIT);
  }, [tasks, filter]);

  const handleExportReport = () =>
    runExport({
      queuedTitle: "Report Export Started",
      queuedMessage: "Your report is being prepared. We'll notify you when it's ready to download.",
      failureMessage: "Failed to trigger report export.",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Dashboard Overview" : "My Workspace Dashboard"}
        actions={
          <>
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={handleExportReport}
                disabled={isExporting}
                className="gap-2 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isExporting ? "Queuing Job..." : "Export Report"}</span>
              </Button>
            )}
            <Link to="/tasks" className="w-full sm:w-auto">
              <Button variant="primary" className="gap-1.5 w-full sm:w-auto">
                <Plus className="w-4 h-4 shrink-0" />
                <span>Manage Tasks</span>
              </Button>
            </Link>
          </>
        }
      />

      <DashboardMetrics metrics={metrics} isAdmin={isAdmin} />

      <Card
        title={isAdmin ? "Recent Team Deliverables" : "Your Recent Deliverables"}
        subtitle={
          isTasksLoading
            ? undefined
            : `Showing top ${filteredTasks.length} ${isAdmin ? "recent tasks" : "tasks assigned to you"}`
        }
        headerActions={<StatusFilterTabs value={filter} onChange={setFilter} />}
      >
        {isTasksLoading ? (
          <LoadingState message="Loading tasks..." />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            message={`No tasks matching "${filter}".`}
            actionLabel="Reset Filter"
            onAction={() => setFilter("ALL")}
          />
        ) : (
          <TaskTable
            tasks={filteredTasks}
            onToggleComplete={toggleComplete}
            onRemove={isAdmin ? requestRemove : undefined}
          />
        )}
      </Card>

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

export default DashboardPage;
