import type { ActivityPoint } from "./activity-chart-data";

export function ActivityDataTable({ points }: { points: ActivityPoint[] }) {
  const total = points.reduce((sum, point) => sum + point.count, 0);
  return (
    <details className="rounded-lg border bg-background/50 px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
        View exact activity data ({points.length} activities)
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Activity counts in the selected date range
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-2">
                Activity
              </th>
              <th scope="col" className="p-2">
                Category
              </th>
              <th scope="col" className="p-2">
                Category status
              </th>
              <th scope="col" className="p-2 text-right">
                Count
              </th>
              <th scope="col" className="p-2 text-right">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.name} className="border-b last:border-0">
                <th scope="row" className="p-2 font-medium">
                  {point.name}
                </th>
                <td className="p-2">{point.category}</td>
                <td className="p-2">{point.active ? "Active" : "Inactive"}</td>
                <td className="p-2 text-right tabular-nums">{point.count}</td>
                <td className="p-2 text-right tabular-nums">
                  {total ? ((point.count / total) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
