import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import type { Task, Employee, User } from "../../../types";

export interface TaskFormData {
  title: string;
  assignee: string;
  priority: string;
  status: string;
  dueDate: string;
  description?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: TaskFormData) => Promise<void>;
  initialTask?: Task | null;
  isAdmin: boolean;
  currentUser: User | null;
  employeeList: Employee[];
  isLoading: boolean;
}

const BLANK_TASK: TaskFormData = {
  title: "",
  assignee: "Unassigned",
  priority: "Medium",
  status: "TODO",
  dueDate: "2026-08-26",
};

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  isAdmin,
  currentUser,
  employeeList,
  isLoading,
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(BLANK_TASK);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        assignee: initialTask.assignedTo || initialTask.employee?.id || "Unassigned",
        priority: initialTask.priority || "Medium",
        status: initialTask.status || "TODO",
        dueDate: initialTask.dueDate ? initialTask.dueDate.split("T")[0] : "2026-08-26",
      });
    } else {
      setFormData({
        ...BLANK_TASK,
        assignee: !isAdmin && currentUser?.id ? currentUser.id : "Unassigned",
      });
    }
    setFormErrors({});
  }, [initialTask, isOpen, isAdmin, currentUser]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Task title is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const isEditing = Boolean(initialTask);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task` : "Create New Task"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Title <span className="text-red-500">*</span>
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
            {isAdmin ? (
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Unassigned">Unassigned</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={`${currentUser?.name || "You"} (Assigned to You)`}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            )}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODO">To Do (Default)</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
