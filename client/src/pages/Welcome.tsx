import { format, subDays } from "date-fns";
import { Activity, Calendar, CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth";
import { AddActivityForm } from "../components/forms/AddActivityForm/AddActivityForm";
import { AddWithDetailsDialog } from "../components/forms/AddActivityForm/AddWithDetailsDialog";
import { IntensityBadge } from "../components/IntensityBadge";
import { OnboardingCard } from "../components/OnboardingCard";
import { Loading } from "../components/states/Loading";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  sortDescendingByDate,
  useActivities,
  useActivitiesWithLimit,
  useCategories,
} from "../data";
import { getActivityColor } from "../utils/colors";

const STAT_ICONS = [
  { icon: Activity, colorVar: "var(--color-chart-2)" },
  { icon: Calendar, colorVar: "var(--color-chart-3)" },
  { icon: CalendarDays, colorVar: "var(--color-chart-4)" },
  { icon: Clock, colorVar: "var(--color-chart-5)" },
] as const;

function useStats(allData: ReturnType<typeof useActivities>["data"]) {
  if (!allData) {
    return null;
  }
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);
  const active = allData.filter((a) => a.active);
  const sorted = sortDescendingByDate([...active]);
  const total = allData.length;
  const lastWeek = active.filter((a) => a.date >= sevenDaysAgo).length;
  const lastMonth = active.filter((a) => a.date >= thirtyDaysAgo).length;
  const last = sorted[0];
  return { total, lastWeek, lastMonth, last };
}

function useStatCards(allData: ReturnType<typeof useActivities>["data"]) {
  const stats = useStats(allData);
  if (!stats) {
    return [
      { title: "Total Activities", value: "--", subtitle: "All time" },
      { title: "Last 7 Days", value: "--", subtitle: "Active activities" },
      { title: "Last 30 Days", value: "--", subtitle: "Active activities" },
      { title: "Last Activity", value: "--", subtitle: "-" },
    ];
  }
  return [
    {
      title: "Total Activities",
      value: String(stats.total),
      subtitle: "All time",
    },
    {
      title: "Last 7 Days",
      value: String(stats.lastWeek),
      subtitle: "Active activities",
    },
    {
      title: "Last 30 Days",
      value: String(stats.lastMonth),
      subtitle: "Active activities",
    },
    {
      title: "Last Activity",
      value: stats.last?.name ?? "None",
      subtitle: stats.last ? format(stats.last.date, "MMM d, yyyy") : "-",
      capitalize: true,
    },
  ];
}

export const Welcome = () => {
  const { user } = useAuth();
  const { data: limitedData, isLoading } = useActivitiesWithLimit();
  const { data: allData } = useActivities();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);
  const lastActivity = limitedData
    ? sortDescendingByDate([...limitedData])[0]
    : undefined;
  const recentActivities = limitedData
    ? sortDescendingByDate([...limitedData]).slice(0, 5)
    : [];

  const statCards = useStatCards(allData);

  if (isLoading || categoriesLoading) {
    return <Loading />;
  }

  const showOnboarding =
    !onboardingSkipped && categories !== undefined && categories.length === 0;

  const header = (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary tabular-nums">
        {format(new Date(), "EEEE, MMM d")}
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold heading-gradient mt-1">
        Welcome{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>
      <p className="text-muted-foreground mt-1">
        Track your activities and stay healthy
      </p>
    </div>
  );

  if (showOnboarding) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {header}
        <OnboardingCard onSkip={() => setOnboardingSkipped(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {header}

      {/* Stat Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const { icon: Icon, colorVar } = STAT_ICONS[i];
          return (
            <Card
              key={stat.title}
              className="bloom-hover border-l-[3px] py-4 gap-2 animate-fade-slide-up"
              style={{
                borderLeftColor: colorVar,
                animationDelay: `${i * 75}ms`,
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${colorVar} 12%, transparent)`,
                    color: colorVar,
                  }}
                >
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold tabular-nums ${"capitalize" in stat && stat.capitalize ? "capitalize" : ""}`}
                  style={{ color: colorVar }}
                >
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Log Activity + Recent Activities */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Log Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Log Activity</CardTitle>
            <CardDescription>Quickly log your latest activity</CardDescription>
            <CardAction>
              <AddWithDetailsDialog lastActivity={lastActivity} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <AddActivityForm lastActivity={lastActivity} />
          </CardContent>
        </Card>

        {/* Recent Activities Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your last 5 logged activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No activities logged yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity, i) => {
                  const color = getActivityColor(activity.name);
                  return (
                    <Link
                      to="/activity-list"
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border animate-fade-slide-up cursor-pointer hover:shadow-md transition-shadow"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="flex size-10 items-center justify-center rounded-full shrink-0"
                          style={{
                            backgroundColor: `${color}18`,
                            color,
                          }}
                        >
                          <Activity className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium capitalize truncate">
                              {activity.name}
                            </p>
                            {activity.intensity && (
                              <IntensityBadge intensity={activity.intensity} />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{format(activity.date, "MMM d, yyyy")}</span>
                            {activity.timeSpent && (
                              <span>• {activity.timeSpent} min</span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
