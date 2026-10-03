import { ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import Card from "../../../components/common/Card";

interface EmployeeFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function EmployeeFilterBar({
  searchTerm,
  onSearchChange,
}: EmployeeFilterBarProps) {
  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default EmployeeFilterBar;
