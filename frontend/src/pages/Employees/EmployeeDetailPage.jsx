import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { useGetEmployeeByIdQuery } from "../../store/api/employeeApiSlice";

function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading, isError, error } = useGetEmployeeByIdQuery(id);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
        <p className="text-sm mt-2 font-medium">Fetching employee profile...</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="outline" onClick={() => navigate("/employees")}>
          ← Back to Employees
        </Button>
        <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300">
          <p className="font-semibold text-sm">Employee #{id} not found</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error?.data?.message || "Record may have been deleted."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate("/employees")}
        className="cursor-pointer"
      >
        ← Back to Employees
      </Button>

      <Card
        title={`Employee Profile: ${employee.name}`}
        subtitle="Individual team member overview and contact info"
        badge={`#${employee.id}`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{employee.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{employee.role}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={employee.status === "Active" ? "success" : "warning"}>
                {employee.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Email Address</p>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{employee.email}</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Department</p>
              <p className="font-medium text-gray-900 dark:text-white mt-0.5">{employee.department}</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Employee ID</p>
              <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">#{employee.id}</p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase">Member Since</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                {employee.createdAt || employee.created_at ? new Date(employee.createdAt || employee.created_at).toLocaleDateString() : "Recent"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default EmployeeDetailPage;
