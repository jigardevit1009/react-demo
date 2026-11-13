import Button from "./Button";

interface FormActionsProps {
  submitLabel: string;
  loadingLabel: string;
  isLoading: boolean;
  /** Omit to hide the Cancel button */
  onCancel?: () => void;
}

/** Footer row with Cancel + Submit buttons, used at the bottom of forms and modals. */
export function FormActions({ submitLabel, loadingLabel, isLoading, onCancel }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
      {onCancel && (
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
      )}
      <Button type="submit" variant="primary" disabled={isLoading} className="w-full sm:w-auto px-6">
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}

export default FormActions;
