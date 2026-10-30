import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivitySummaries } from "@/data/types";

export function ChartSummaryStats({
  summaries,
}: {
  summaries: ActivitySummaries;
}) {
  const names = Object.keys(summaries);
  const total = Object.values(summaries).reduce(
    (sum, entry) => sum + entry.count,
    0
  );
  const popular = names
    .filter((name) => summaries[name].active)
    .sort(
      (a, b) => summaries[b].count - summaries[a].count || a.localeCompare(b)
    )[0];
  const stats = [
    {
      title: "Total Activities",
      value: total,
      detail: "In selected date range",
      color: "var(--color-chart-2)",
    },
    {
      title: "Unique Activities",
      value: names.length,
      detail: "Different activity names",
      color: "var(--color-chart-3)",
    },
    {
      title: "Most Popular",
      value: popular ?? "None",
      detail: popular
        ? `${summaries[popular].count} ${summaries[popular].count === 1 ? "time" : "times"}`
        : "No active activities",
      color: "var(--color-chart-1)",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bloom-hover min-w-0 border-l-[3px] py-4 gap-2 animate-fade-slide-up"
          style={{ borderLeftColor: stat.color }}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold tabular-nums [overflow-wrap:anywhere]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
