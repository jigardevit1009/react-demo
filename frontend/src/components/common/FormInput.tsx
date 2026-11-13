import { InputHTMLAttributes, ReactNode, useId } from "react";
import type { LucideIcon } from "lucide-react";
import { FormLabel, FieldMessage, getInputClass } from "./FormField";

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  error?: string;
  hint?: string;
  /** Icon shown inside the input on the left */
  icon?: LucideIcon;
  /** Element rendered on the right of the label */
  labelAction?: ReactNode;
  /** Classes for the outer wrapper */
  className?: string;
}

/** Labeled text input with optional icon, error and hint. */
export function FormInput({
  label,
  required,
  error,
  hint,
  icon: Icon,
  labelAction,
  id,
  name,
  className = "",
  ...inputProps
}: FormInputProps) {
  const autoId = useId();
  const inputId = id || name || autoId;

  return (
    <div className={className}>
      {label && (
        <FormLabel htmlFor={inputId} label={label} required={required} action={labelAction} />
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          className={getInputClass({ hasError: Boolean(error), hasLeftIcon: Boolean(Icon) })}
          {...inputProps}
        />
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
        )}
      </div>
      <FieldMessage error={error} hint={hint} />
    </div>
  );
}

export default FormInput;
