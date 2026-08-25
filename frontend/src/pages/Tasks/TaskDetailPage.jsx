import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useGetTaskByIdQuery } from "../../store/api/taskApiSlice";

function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading, isError, error } = useGetTaskByIdQuery(id);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
        <p className="text-sm mt-2 font-medium">Loading task details...</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="outline" onClick={() => navigate("/tasks")}>
          ← Back to Tasks
        </Button>
        <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300">
          <p className="font-semibold text-sm">Task {id} not found</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error?.data?.message || "Task record may have been deleted."}</p>
        </div>
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
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Assigned To</p>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{task.assignee}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "info"}>
                {task.priority} Priority
              </Badge>
              <Badge variant={task.status === "Completed" ? "success" : "info"}>
                {task.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Target Due Date</p>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5 font-mono">{task.dueDate || "No deadline"}</p>
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
