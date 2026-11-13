import { SelectHTMLAttributes, useId } from "react";
import { FormLabel, FieldMessage, getInputClass } from "./FormField";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: SelectOption[];
  label?: string;
  error?: string;
  /** Classes for the outer wrapper (use for width, e.g. "md:w-auto") */
  className?: string;
}

/** Labeled <select>. Without a label it works as a compact filter dropdown. */
export function FormSelect({
  options,
  label,
  required,
  error,
  id,
  name,
  className = "",
  ...selectProps
}: FormSelectProps) {
  const autoId = useId();
  const selectId = id || name || autoId;

  return (
    <div className={className}>
      {label && <FormLabel htmlFor={selectId} label={label} required={required} />}
      <select
        id={selectId}
        name={name}
        className={`${getInputClass({ hasError: Boolean(error) })} cursor-pointer truncate`}
        {...selectProps}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldMessage error={error} />
    </div>
  );
}

export default FormSelect;
