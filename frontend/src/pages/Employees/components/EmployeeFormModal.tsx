import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import type { Employee } from "../../../types";

export interface EmployeeFormData {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EmployeeFormData) => Promise<void>;
  initialEmployee?: Employee | null;
  isLoading: boolean;
  errorMessage?: string;
}

const BLANK_FORM: EmployeeFormData = {
  name: "",
  email: "",
  role: "",
  status: "Active",
};

export function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialEmployee,
  isLoading,
  errorMessage,
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(BLANK_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialEmployee) {
      setFormData({
        name: initialEmployee.name,
        email: initialEmployee.email,
        role: initialEmployee.role,
        status: initialEmployee.status,
      });
    } else {
      setFormData(BLANK_FORM);
    }
    setFormErrors({});
  }, [initialEmployee, isOpen]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.role.trim()) errors.role = "Role is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const isEditing = Boolean(initialEmployee);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Employee ${initialEmployee?.id}` : "Add New Employee"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Jordan Bell"
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.name
                ? "border-rose-500 focus:ring-rose-500"
                : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            }`}
          />
          {formErrors.name && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {formErrors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="jordan.b@company.com"
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.email
                ? "border-rose-500 focus:ring-rose-500"
                : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            }`}
          />
          {formErrors.email && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
              {formErrors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="e.g. Software Developer"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.role
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              }`}
            />
            {formErrors.role && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {formErrors.role}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                : "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EmployeeFormModal;
