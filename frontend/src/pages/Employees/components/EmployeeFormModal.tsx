import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import Alert from "../../../components/common/Alert";
import FormInput from "../../../components/common/FormInput";
import FormSelect, { SelectOption } from "../../../components/common/FormSelect";
import FormActions from "../../../components/common/FormActions";
import type { Employee } from "../../../types";
import {
  sanitizeText,
  removeWhitespace,
  validateName,
  validateEmail,
  validateTitle,
} from "../../../utils/validation";

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

const STATUS_OPTIONS: SelectOption[] = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (name === "email") cleanValue = removeWhitespace(value);
    else if (name === "name" || name === "role") cleanValue = sanitizeText(value);
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const nameErr = validateName(formData.name, "Employee name");
    if (nameErr) errors.name = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    const roleErr = validateTitle(formData.role, "Role", { minLength: 2, maxLength: 60 });
    if (roleErr) errors.role = roleErr;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role.trim(),
    });
  };

  const isEditing = Boolean(initialEmployee);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Employee" : "Add New Employee"}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert variant="error">{errorMessage}</Alert>

        <FormInput
          label="Employee Name"
          required
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter employee's name"
          error={formErrors.name}
        />

        <FormInput
          label="Email Address"
          required
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter employee's email address"
          error={formErrors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Role"
            required
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="Enter job role (e.g. Software Developer)"
            error={formErrors.role}
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
          submitLabel={isEditing ? "Save Changes" : "Create Employee"}
          loadingLabel={isEditing ? "Updating..." : "Saving..."}
        />
      </form>
    </Modal>
  );
}

export default EmployeeFormModal;
