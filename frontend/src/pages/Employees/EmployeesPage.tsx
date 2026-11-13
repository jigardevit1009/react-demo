import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import PaginationBar from "../../components/common/PaginationBar";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/DataState";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  EmployeesResponse,
} from "../../store/api/employeeApiSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../utils/error";
import { toEmployeeList } from "../../utils/employee";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeFormModal, EmployeeFormData } from "./components/EmployeeFormModal";
import type { Employee } from "../../types";

const ITEMS_PER_PAGE = 10;

function EmployeesPage() {
  // ---- Search & pagination ----
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 400);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ---- Data ----
  const { data, isLoading, isFetching, isError, error, refetch } = useGetEmployeesQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearchTerm,
  });

  const employees = toEmployeeList(data);
  const totalEmployees = (data as EmployeesResponse)?.total ?? employees.length;
  const totalPages =
    (data as EmployeesResponse)?.totalPages ?? Math.ceil(totalEmployees / ITEMS_PER_PAGE) ?? 1;

  // ---- Actions ----
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [removingEmployee, setRemovingEmployee] = useState<Employee | null>(null);
  const [modalError, setModalError] = useState<string>("");

  const openModal = useCallback((emp: Employee | null = null) => {
    setEditingEmployee(emp);
    setModalError("");
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleModalSubmit = async (formData: EmployeeFormData) => {
    setModalError("");
    try {
      if (editingEmployee) {
        await updateEmployee({ id: editingEmployee.id, ...formData }).unwrap();
      } else {
        await createEmployee(formData).unwrap();
      }
      closeModal();
      refetch();
    } catch (err: unknown) {
      console.error("Employee submit error:", err);
      setModalError(getErrorMessage(err, "Failed to save employee"));
    }
  };

  const handleConfirmRemove = async () => {
    if (!removingEmployee) return;
    try {
      await deleteEmployee(removingEmployee.id).unwrap();
      setRemovingEmployee(null);
      refetch();
    } catch (err) {
      console.error("Failed to remove employee:", err);
    }
  };

  // ---- Render ----
  const renderTableContent = () => {
    if (isLoading) return <LoadingState message="Loading employees..." />;
    if (isError) {
      return (
        <ErrorState
          title="Failed to load employees"
          message={getErrorMessage(error, "Please check your network connection")}
        />
      );
    }
    if (employees.length === 0) {
      return (
        <EmptyState
          title="No employees found"
          message="Try clearing filters or search terms."
          actionLabel="Reset Filters"
          onAction={() => handleSearchChange("")}
        />
      );
    }
    return <EmployeeTable employees={employees} onEdit={openModal} onRemove={setRemovingEmployee} />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees Directory"
        actions={
          <Button variant="primary" onClick={() => openModal()} className="gap-1.5 w-full sm:w-auto">
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Employee</span>
          </Button>
        }
      />

      <Card
        title="Team Members"
        subtitle={
          isLoading
            ? "Loading records..."
            : `Showing page ${currentPage} of ${totalPages} (${totalEmployees} total employees)`
        }
        headerActions={
          <div className="flex md:justify-end">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search employees by name or email"
              className="w-full md:w-80"
            />
          </div>
        }
      >
        {renderTableContent()}
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

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialEmployee={editingEmployee}
        isLoading={isCreating || isUpdating}
        errorMessage={modalError}
      />

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
