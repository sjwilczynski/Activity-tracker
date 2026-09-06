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
import { buildWeeklyHeatmap } from "./weekly-heatmap-data";
import { WeeklyHeatmap } from "./WeeklyHeatmap";

export function WeeklyHeatmapCard() {
  const { data, isLoading, error, refetch } = useActivities();

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
        ) : error ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Activity heatmap could not be loaded.{" "}
            <button className="underline" onClick={() => void refetch()}>
              Try again
            </button>
          </p>
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
