import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import FormInput from "../../../components/common/FormInput";
import FormSelect, { SelectOption } from "../../../components/common/FormSelect";
import FormActions from "../../../components/common/FormActions";
import type { Task, Employee, User } from "../../../types";
import { sanitizeText, validateTitle } from "../../../utils/validation";

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

const DEFAULT_DUE_DATE = "2026-08-26";

const BLANK_TASK: TaskFormData = {
  title: "",
  assignee: "Unassigned",
  priority: "Medium",
  status: "TODO",
  dueDate: DEFAULT_DUE_DATE,
};

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "TODO", label: "To Do (Default)" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
];

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
        dueDate: initialTask.dueDate ? initialTask.dueDate.split("T")[0] : DEFAULT_DUE_DATE,
      });
    } else {
      setFormData({
        ...BLANK_TASK,
        assignee: !isAdmin && currentUser?.id ? currentUser.id : "Unassigned",
      });
    }
    setFormErrors({});
  }, [initialTask, isOpen, isAdmin, currentUser]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanValue = name === "title" ? sanitizeText(value) : value;
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const titleErr = validateTitle(formData.title, "Task title");
    if (titleErr) errors.title = titleErr;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...formData, title: formData.title.trim() });
  };

  const isEditing = Boolean(initialTask);
  const assigneeOptions: SelectOption[] = [
    { value: "Unassigned", label: "Unassigned" },
    ...employeeList.map((emp) => ({ value: emp.id, label: `${emp.name} (${emp.role})` })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Task" : "Create New Task"}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormInput
          label="Task Title"
          required
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter task title"
          error={formErrors.title}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isAdmin ? (
            <FormSelect
              label="Assign To Employee"
              name="assignee"
              value={formData.assignee}
              onChange={handleInputChange}
              options={assigneeOptions}
            />
          ) : (
            <FormInput
              label="Assign To Employee"
              disabled
              value={`${currentUser?.name || "You"} (Assigned to You)`}
            />
          )}

          <FormInput
            label="Due Date"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            options={PRIORITY_OPTIONS}
          />
          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={STATUS_OPTIONS}
          />
        </div>

        <FormActions
          onCancel={onClose}
          isLoading={isLoading}
          submitLabel={isEditing ? "Save Changes" : "Create Task"}
          loadingLabel={isEditing ? "Updating..." : "Creating..."}
        />
      </form>
    </Modal>
  );
}

export default TaskFormModal;
