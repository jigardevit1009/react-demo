import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "../../store/api/employeeApiSlice";
import { useDebounce } from "../../hooks/useDebounce";

const BLANK_FORM = {
  name: "",
  email: "",
  role: "",
  department: "Engineering",
  status: "Active",
};

const ITEMS_PER_PAGE = 10;

function EmployeesPage() {
  // 1. Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // 2. Fetch paginated employees from backend (10 items per chunk)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetEmployeesQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearchTerm,
    department: departmentFilter,
  });

  const employees = data?.employees || (Array.isArray(data) ? data : []);
  const totalEmployees = data?.total || employees.length;
  const totalPages = data?.totalPages || Math.ceil(totalEmployees / ITEMS_PER_PAGE) || 1;

  // 3. Mutations
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  // 4. Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const [formData, setFormData] = useState(BLANK_FORM);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
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

  const handleOpenAddModal = useCallback(() => {
    setFormData(BLANK_FORM);
    setFormErrors({});
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department,
      status: emp.status,
    });
    setFormErrors({});
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createEmployee(formData).unwrap();
      setIsAddModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to create employee:", err);
      setFormErrors({ general: err?.data?.message || "Failed to create employee" });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await updateEmployee({ id: editingEmployee.id, ...formData }).unwrap();
      setEditingEmployee(null);
      refetch();
    } catch (err) {
      console.error("Failed to update employee:", err);
      setFormErrors({ general: err?.data?.message || "Failed to update employee" });
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingEmployee) {
      try {
        await deleteEmployee(deletingEmployee.id).unwrap();
        setDeletingEmployee(null);
        refetch();
      } catch (err) {
        console.error("Failed to delete employee:", err);
      }
    }
  };

  // Reset to page 1 on filter or search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Employees Directory
            </h1>
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage company staff, roles, and departmental assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer"
          >
            ↻ Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            + Add Employee
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Department:</span>
            <select
              value={departmentFilter}
              onChange={handleDepartmentChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card
        title="Team Members"
        subtitle={
          isLoading
            ? "Loading records..."
            : `Showing page ${currentPage} of ${totalPages} (${totalEmployees} total employees)`
        }
      >
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
            <p className="text-sm font-medium">Loading employee records...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 space-y-2">
            <p className="font-semibold text-sm">Failed to load employees</p>
            <p className="text-xs text-red-500 dark:text-red-400">{error?.error || "Please check your network connection"}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No employees found</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchTerm("");
                setDepartmentFilter("ALL");
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{emp.id}</td>
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
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-medium">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.status === "Active" ? "success" : "warning"}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(emp)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => setDeletingEmployee(emp)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing <strong className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalEmployees)}
              </strong>{" "}
              of <strong className="font-semibold text-gray-900 dark:text-white">{totalEmployees}</strong> entries
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isFetching}
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages || isFetching}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formErrors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-lg">
              {formErrors.general}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Jordan Bell"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.name ? "border-rose-500 focus:ring-rose-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              }`}
            />
            {formErrors.name && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jordan.b@company.com"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.email ? "border-rose-500 focus:ring-rose-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
              }`}
            />
            {formErrors.email && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{formErrors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  formErrors.role ? "border-rose-500 focus:ring-rose-500" : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                }`}
              />
              {formErrors.role && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{formErrors.role}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? "Saving..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editingEmployee !== null} onClose={() => setEditingEmployee(null)} title={`Edit Employee #${editingEmployee?.id}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setEditingEmployee(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deletingEmployee !== null} onClose={() => setDeletingEmployee(null)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to permanently delete employee <strong className="text-gray-900 dark:text-white">{deletingEmployee?.name}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="secondary" onClick={() => setDeletingEmployee(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EmployeesPage;
