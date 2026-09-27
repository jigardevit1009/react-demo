import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  itemLabel?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isFetching = false,
  itemLabel = "entries",
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing{" "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {startItem}
        </strong>{" "}
        to{" "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {endItem}
        </strong>{" "}
        of{" "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {totalItems}
        </strong>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || isFetching}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-1 px-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages || isFetching}
          className="flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationBar;
