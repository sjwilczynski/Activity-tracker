import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

export function useWelcomeData() {
  const context = getRouteApi("/_authenticated/welcome").useRouteContext();
  const { data: recentActivities } = useSuspenseQuery(
    context.recentActivitiesQuery
  );
  const { data: categories } = useSuspenseQuery(context.categoriesQuery);
  const history = useQuery(context.activitiesQuery);
  return { recentActivities, categories, history };
}
