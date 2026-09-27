export type EmployeeStatus = "Active" | "Inactive" | string;

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW" | "High" | "Medium" | "Low" | string;

export type TaskStatus =
  | "TODO"
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "Todo"
  | "Pending"
  | "In Progress"
  | "Completed"
  | string;

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  isSuperAdmin?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  due_date?: string | null;
  assignedTo?: string | null;
  assignee?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  employee?: Employee | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isSuperAdmin?: boolean;
  status?: EmployeeStatus;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface NotificationItem {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "report" | string;
  downloadUrl?: string;
}

export interface PaginatedResponse<T> {
  data?: T;
  employees?: Employee[];
  tasks?: Task[];
  total?: number;
  totalPages?: number;
  currentPage?: number;
  page?: number;
  limit?: number;
}
