import { Search, X } from "lucide-react";
import { getInputClass } from "./FormField";
import { sanitizeText } from "../../utils/validation";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Classes for the outer wrapper (use for width) */
  className?: string;
}

/** Search box with icon + clear button. Blocks leading / repeated spaces. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(sanitizeText(e.target.value))}
        placeholder={placeholder}
        aria-label={placeholder}
        className={getInputClass({ hasLeftIcon: true, hasRightIcon: true })}
      />
      <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
