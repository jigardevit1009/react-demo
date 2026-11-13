import { ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type AlertVariant = "error" | "success";

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300",
  success: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300",
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

/** Inline form/page message box. Renders nothing when there is no content. */
export function Alert({ variant = "error", children, className = "" }: AlertProps) {
  if (!children) return null;
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`p-3 border rounded-lg text-sm flex items-start gap-2 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default Alert;
