import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  RotateCw,
  Edit2,
  Trash2,
} from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PaginationBar from "../../components/common/PaginationBar";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  EmployeesResponse,
} from "../../store/api/employeeApiSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../utils/error";
import { getEmployeeStatusVariant } from "../../utils/variants";
import { EmployeeFilterBar } from "./components/EmployeeFilterBar";
import { EmployeeFormModal, EmployeeFormData } from "./components/EmployeeFormModal";
import type { Employee } from "../../types";

const ITEMS_PER_PAGE = 10;

function EmployeesPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 400);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetEmployeesQuery({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearchTerm,
    });

  const employees: Employee[] = data
    ? Array.isArray(data)
      ? data
      : (data as EmployeesResponse).employees || []
    : [];

  const totalEmployees =
    (data as EmployeesResponse)?.total ?? employees.length;
  const totalPages =
    (data as EmployeesResponse)?.totalPages ??
    Math.ceil(totalEmployees / ITEMS_PER_PAGE) ??
    1;

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [removingEmployee, setRemovingEmployee] = useState<Employee | null>(null);
  const [modalError, setModalError] = useState<string>("");

  const handleOpenAddModal = useCallback(() => {
    setEditingEmployee(null);
    setModalError("");
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
    setModalError("");
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = async (formData: EmployeeFormData) => {
    setModalError("");
    try {
      if (editingEmployee) {
        await updateEmployee({ id: editingEmployee.id, ...formData }).unwrap();
      } else {
        await createEmployee(formData).unwrap();
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      refetch();
    } catch (err: unknown) {
      console.error("Employee submit error:", err);
      setModalError(getErrorMessage(err, "Failed to save employee"));
    }
  };

  const handleConfirmRemove = async () => {
    if (removingEmployee) {
      try {
        await deleteEmployee(removingEmployee.id).unwrap();
        setRemovingEmployee(null);
        refetch();
      } catch (err) {
        console.error("Failed to remove employee:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Employees Directory
            </h1>
            {isFetching && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                Syncing...
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <RotateCw
              className={`w-3.5 h-3.5 shrink-0 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <EmployeeFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
      />

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
            <p className="text-xs text-red-500 dark:text-red-400">
              {getErrorMessage(error, "Please check your network connection")}
            </p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No employees found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try clearing filters or search terms.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchTerm("");
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
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {emp.name}
                      </Link>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {emp.role}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getEmployeeStatusVariant(emp.status)}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditModal(emp)}
                        className="inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1"
                        onClick={() => setRemovingEmployee(emp)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalEmployees}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          isFetching={isFetching}
          itemLabel="entries"
        />
      </Card>

      {/* Employee Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleModalSubmit}
        initialEmployee={editingEmployee}
        isLoading={isCreating || isUpdating}
        errorMessage={modalError}
      />

      {/* Remove Employee Modal */}
      <ConfirmDeleteModal
        isOpen={removingEmployee !== null}
        onClose={() => setRemovingEmployee(null)}
        onConfirm={handleConfirmRemove}
        title="Confirm Employee Removal"
        itemType="employee"
        itemName={removingEmployee?.name}
        isLoading={isDeleting}
        confirmButtonText="Remove Employee"
      />
    </div>
  );
}

export default EmployeesPage;
