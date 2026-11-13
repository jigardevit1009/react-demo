/**
 * Task helpers shared across Dashboard, Tasks and detail pages.
 * Statuses may arrive as ENUM ("IN_PROGRESS") or Title Case ("In Progress").
 */
import type { Task } from "../types";
import type { TasksResponse } from "../store/api/taskApiSlice";

/** "In Progress" / "in_progress" / "IN PROGRESS" -> "IN_PROGRESS" */
export function normalizeStatus(status?: string): string {
  return (status || "").toUpperCase().replace(/\s+/g, "_");
}

export function isTaskCompleted(status?: string): boolean {
  return normalizeStatus(status) === "COMPLETED";
}

/** The tasks API returns either a plain array or a paginated object. */
export function toTaskList(data?: TasksResponse | Task[]): Task[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.tasks || [];
}
