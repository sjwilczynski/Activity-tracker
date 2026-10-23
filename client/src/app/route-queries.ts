import type { GetAuthToken } from "../data/apiClient";
import {
  activitiesQueryOptions,
  activitiesWithLimitQueryOptions,
  categoriesQueryOptions,
  preferencesQueryOptions,
} from "../data/queryOptions";

type SharedQueries = {
  activitiesQuery: ReturnType<typeof activitiesQueryOptions>;
  categoriesQuery: ReturnType<typeof categoriesQueryOptions>;
  preferencesQuery: ReturnType<typeof preferencesQueryOptions>;
};
const sharedQueries = new WeakMap<GetAuthToken, SharedQueries>();
const recentQueries = new WeakMap<
  GetAuthToken,
  ReturnType<typeof activitiesWithLimitQueryOptions>
>();

// Router recomputes synchronous context on search navigation, even without loaderDeps.
// The token supplier is stable for exactly one authenticated runtime.
export function authenticatedQueries(
  getAuthToken: GetAuthToken
): SharedQueries {
  let queries = sharedQueries.get(getAuthToken);
  if (!queries) {
    queries = {
      activitiesQuery: activitiesQueryOptions(getAuthToken),
      categoriesQuery: categoriesQueryOptions(getAuthToken),
      preferencesQuery: preferencesQueryOptions(getAuthToken),
    };
    sharedQueries.set(getAuthToken, queries);
  }
  return queries;
}

export function recentActivitiesQuery(getAuthToken: GetAuthToken) {
  let query = recentQueries.get(getAuthToken);
  if (!query) {
    query = activitiesWithLimitQueryOptions(getAuthToken, 5);
    recentQueries.set(getAuthToken, query);
  }
  return query;
}
