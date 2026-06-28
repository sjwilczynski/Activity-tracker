import { useMemo } from "react";
import { Loading } from "@/components/states/Loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActivities } from "@/data";
import { HeatmapLegend } from "./HeatmapLegend";
import { WeeklyHeatmap } from "./WeeklyHeatmap";
import { buildWeeklyHeatmap } from "./weekly-heatmap-data";

export function WeeklyHeatmapCard() {
  const { data, isLoading } = useActivities();

  const buckets = useMemo(
    () => buildWeeklyHeatmap(data ?? [], { weeks: 52 }),
    [data]
  );

  const hasActivities = (data?.length ?? 0) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity Heatmap</CardTitle>
        <CardDescription>
          Each cell is one week over the last 52 weeks · counts active
          activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading />
        ) : !hasActivities ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activities yet — log your first activity to start building your
            weekly heatmap.
          </p>
        ) : (
          <div className="space-y-3">
            <WeeklyHeatmap buckets={buckets} />
            <div className="flex justify-end">
              <HeatmapLegend />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
