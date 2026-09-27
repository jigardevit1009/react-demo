import type { BadgeVariant } from "../components/common/Badge";

/**
 * Returns consistent Badge variant based on task priority level
 */
export const getPriorityVariant = (priority?: string): BadgeVariant => {
  const p = priority?.toUpperCase();
  switch (p) {
    case "HIGH":
      return "danger";
    case "MEDIUM":
      return "warning";
    default:
      return "info";
  }
};

/**
 * Returns consistent Badge variant based on task status
 */
export const getStatusVariant = (status?: string): BadgeVariant => {
  const s = status?.toUpperCase()?.replace(/\s+/g, "_");
  switch (s) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PENDING":
      return "warning";
    case "TODO":
      return "purple";
    default:
      return "neutral";
  }
};

/**
 * Returns consistent Badge variant based on employee status
 */
export const getEmployeeStatusVariant = (status?: string): BadgeVariant => {
  return status === "Active" ? "success" : "warning";
};
