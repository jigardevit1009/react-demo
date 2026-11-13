import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { LoadingState, ErrorState } from "../../components/common/DataState";
import { TaskStatusBadge, TaskPriorityBadge } from "../../components/common/TaskBadges";
import { useGetTaskByIdQuery } from "../../store/api/taskApiSlice";
import { getErrorMessage } from "../../utils/error";
import { formatDate } from "../../utils/date";

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: task, isLoading, isError, error } = useGetTaskByIdQuery(id);

  if (isLoading) return <LoadingState message="Loading task details..." />;

  if (isError || !task) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="outline" onClick={() => navigate("/tasks")}>
          ← Back to Tasks
        </Button>
        <ErrorState
          title={`Task ${id} not found`}
          message={getErrorMessage(error, "Task record may have been deleted.")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate("/tasks")}
        className="cursor-pointer"
      >
        ← Back to Tasks
      </Button>

      <Card
        title={`Task: ${task.title}`}
        subtitle="Deliverable details and assignment status"
        badge={`${task.id}`}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Assigned To</p>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {task.employee?.name || task.assignee || "Unassigned"}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TaskPriorityBadge priority={task.priority} showSuffix />
              <TaskStatusBadge status={task.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Target Due Date</p>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5 font-mono">
                {formatDate(task.dueDate)}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Task Identifier</p>
              <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">{task.id}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TaskDetailPage;
