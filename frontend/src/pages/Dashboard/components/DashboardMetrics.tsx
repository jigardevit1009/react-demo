import MetricCard from "./MetricCard";

export interface DashboardMetricValues {
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  productivityScore: number;
}

interface DashboardMetricsProps {
  metrics: DashboardMetricValues;
  isAdmin: boolean;
}

/** Row of 4 KPI cards. Admins see team-wide numbers, members see their own. */
export function DashboardMetrics({ metrics, isAdmin }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {isAdmin ? (
        <MetricCard
          title="Total Employees"
          value={metrics.totalEmployees}
          badge="Directory"
          badgeColor="text-emerald-600"
          subtitle="Active team members"
        />
      ) : (
        <MetricCard
          title="Assigned Tasks"
          value={metrics.totalTasks}
          badge="My Deliverables"
          badgeColor="text-indigo-600"
          subtitle="Total tasks assigned to you"
        />
      )}

      <MetricCard
        title="Active Tasks"
        value={metrics.activeTasks}
        badge="Active"
        badgeColor="text-blue-600"
        subtitle={isAdmin ? "Tasks awaiting completion" : "Your open deliverables"}
      />

      <MetricCard
        title="Completed Tasks"
        value={metrics.completedTasks}
        badge="Delivered"
        badgeColor="text-emerald-600"
        subtitle={isAdmin ? "Total completed" : "Completed by you"}
      />

      <MetricCard
        title="Productivity Rate"
        value={`${metrics.productivityScore}%`}
        badge={isAdmin ? "Target: 80%" : "My Rate"}
        badgeColor="text-purple-600"
        subtitle={isAdmin ? "Overall completion rate" : "Your completion rate"}
        progress={metrics.productivityScore}
        progressColor="bg-purple-600"
      />
    </div>
  );
}

export default DashboardMetrics;
