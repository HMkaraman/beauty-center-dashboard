export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-full bg-secondary" />
              <div className="h-5 w-16 rounded bg-secondary" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 w-24 rounded bg-secondary" />
              <div className="h-4 w-32 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 animate-pulse"
          >
            <div className="h-5 w-40 rounded bg-secondary" />
            <div className="mt-4 h-[280px] rounded bg-secondary/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
