import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import Badge from "../../../components/common/Badge";
import IconButton from "../../../components/common/IconButton";
import { getEmployeeStatusVariant } from "../../../utils/variants";
import type { Employee } from "../../../types";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onRemove: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onEdit, onRemove }: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
        <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  to={`/employees/${emp.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {emp.name}
                </Link>
                <p className="text-xs text-gray-400">{emp.email}</p>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{emp.role}</td>
              <td className="px-4 py-3">
                <Badge variant={getEmployeeStatusVariant(emp.status)}>{emp.status}</Badge>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <IconButton icon={Edit2} label="Edit employee" tone="primary" onClick={() => onEdit(emp)} />
                  <IconButton icon={Trash2} label="Remove employee" tone="danger" onClick={() => onRemove(emp)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
