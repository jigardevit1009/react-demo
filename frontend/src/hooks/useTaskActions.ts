import { useState, useCallback } from "react";
import {
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../store/api/taskApiSlice";
import { isTaskCompleted } from "../utils/task";
import type { Task } from "../types";

/**
 * Shared row actions for task tables: toggle done / undo and remove (with confirm state).
 * `onChanged` runs after every successful change (e.g. to refetch the list).
 */
export function useTaskActions(onChanged?: () => void) {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [removingTask, setRemovingTask] = useState<Task | null>(null);

  const toggleComplete = useCallback(
    async (task: Task) => {
      const newStatus = isTaskCompleted(task.status) ? "TODO" : "COMPLETED";
      try {
        await updateTask({ id: task.id, status: newStatus }).unwrap();
        onChanged?.();
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    },
    [updateTask, onChanged],
  );

  const confirmRemove = useCallback(async () => {
    if (!removingTask) return;
    try {
      await deleteTask(removingTask.id).unwrap();
      setRemovingTask(null);
      onChanged?.();
    } catch (err) {
      console.error("Failed to remove task:", err);
    }
  }, [deleteTask, removingTask, onChanged]);

  return {
    toggleComplete,
    removingTask,
    requestRemove: setRemovingTask,
    cancelRemove: () => setRemovingTask(null),
    confirmRemove,
    isDeleting,
  };
}
