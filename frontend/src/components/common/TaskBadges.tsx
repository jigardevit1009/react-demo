import React from "react";
import Badge from "./Badge";
import { getPriorityVariant, getStatusVariant } from "../../utils/variants";

export interface TaskStatusBadgeProps {
  status?: string;
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status = "PENDING" }) => {
  return (
    <Badge variant={getStatusVariant(status)}>
      {status}
    </Badge>
  );
};

export interface TaskPriorityBadgeProps {
  priority?: string;
  showSuffix?: boolean; // e.g. "Priority" suffix for detail view
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority = "MEDIUM",
  showSuffix = false,
}) => {
  return (
    <Badge variant={getPriorityVariant(priority)}>
      {priority}
      {showSuffix ? " Priority" : ""}
    </Badge>
  );
};
