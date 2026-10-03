import { memo } from "react";
import { Check, X } from "lucide-react";

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function getPasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export type PasswordStrength = "empty" | "weak" | "moderate" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0, 1, 2, 3
  label: string;
  colorClass: string;
  barColor: string;
  criteria: PasswordCriteria;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const criteria = getPasswordCriteria(password);

  if (!password) {
    return {
      strength: "empty",
      score: 0,
      label: "",
      colorClass: "text-gray-400",
      barColor: "bg-gray-200 dark:bg-gray-700",
      criteria,
    };
  }

  // Count satisfied conditions
  const metCount = [
    criteria.minLength,
    criteria.hasUpper,
    criteria.hasLower,
    criteria.hasNumber,
    criteria.hasSpecial,
  ].filter(Boolean).length;

  if (password.length < 6 || metCount <= 2) {
    return {
      strength: "weak",
      score: 1,
      label: "Weak",
      colorClass: "text-rose-500 dark:text-rose-400",
      barColor: "bg-rose-500",
      criteria,
    };
  }

  if (metCount >= 4 && password.length >= 8) {
    return {
      strength: "strong",
      score: 3,
      label: "Strong",
      colorClass: "text-emerald-500 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      criteria,
    };
  }

  return {
    strength: "moderate",
    score: 2,
    label: "Moderate",
    colorClass: "text-amber-500 dark:text-amber-400",
    barColor: "bg-amber-500",
    criteria,
  };
}

interface PasswordStrengthMeterProps {
  password: string;
  showRules?: boolean;
}

export const PasswordStrengthMeter = memo(function PasswordStrengthMeter({
  password,
  showRules = true,
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const result = calculatePasswordStrength(password);
  const { criteria, score, label, colorClass, barColor } = result;

  const rules = [
    { label: "At least 6 characters", met: criteria.minLength },
    { label: "At least one uppercase letter (A-Z)", met: criteria.hasUpper },
    { label: "At least one number (0-9)", met: criteria.hasNumber },
    { label: "At least one special character (!@#$%...)", met: criteria.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2 animate-in fade-in duration-200">
      {/* Strength Bar & Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 grid grid-cols-3 gap-1.5 h-1.5">
          <div
            className={`rounded-full transition-all duration-300 ${
              score >= 1 ? barColor : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
          <div
            className={`rounded-full transition-all duration-300 ${
              score >= 2 ? barColor : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
          <div
            className={`rounded-full transition-all duration-300 ${
              score >= 3 ? barColor : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
          {label}
        </span>
      </div>

      {/* Checklist Rules Below */}
      {showRules && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
          {rules.map((rule, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                rule.met
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {rule.met ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              )}
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default PasswordStrengthMeter;
