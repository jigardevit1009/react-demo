import type { LucideIcon } from "lucide-react";

export type IconButtonTone = "primary" | "success" | "danger" | "neutral";

const TONE_CLASSES: Record<IconButtonTone, string> = {
  primary: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 focus:ring-blue-500",
  success: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:ring-emerald-500",
  danger: "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:ring-rose-500",
  neutral: "text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 focus:ring-gray-300",
};

interface IconButtonProps {
  icon: LucideIcon;
  /** Used as tooltip and screen-reader label */
  label: string;
  onClick: () => void;
  tone?: IconButtonTone;
  disabled?: boolean;
}

/** Icon-only action button (table row actions etc.). */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${TONE_CLASSES[tone]}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export default IconButton;
