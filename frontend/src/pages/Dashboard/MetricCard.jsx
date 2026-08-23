import { memo } from "react";
import Card from "../../components/common/Card";

/**
 * MetricCard Component
 * Wrapped in React.memo to prevent re-rendering when sibling components or parent state changes
 */
const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  badge,
  badgeColor = "text-blue-600",
  progress,
  progressColor = "bg-blue-600",
}) {
  return (
    <Card title={title} badge={badge}>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-xs font-medium ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>

      {progress !== undefined && (
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Card>
  );
});

export default MetricCard;
