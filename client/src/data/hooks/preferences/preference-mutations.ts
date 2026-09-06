import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import { apiFetch, type GetAuthToken } from "../../apiClient";
import {
  getPreferencesQueryId,
  preferencesApiPath,
} from "../../react-query-config/query-constants";
import type { UserPreferences } from "../../types";

type Update = {
  preferences: UserPreferences;
  status: "pending" | "success" | "error";
};
type Overlap = {
  previous: UserPreferences | undefined;
  updates: Update[];
};

// Different preference controls have separate mutation observers on one cache.
const overlaps = new WeakMap<QueryClient, Overlap>();

export function updatePreferencesMutationOptions({
  queryClient,
  getAuthToken,
}: {
  queryClient: QueryClient;
  getAuthToken: GetAuthToken;
}) {
  return mutationOptions({
    mutationFn: async (newPrefs: UserPreferences) => {
      await apiFetch(getAuthToken, preferencesApiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
    },
    retry: false,
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: getPreferencesQueryId });
      let overlap = overlaps.get(queryClient);
      if (!overlap) {
        overlap = {
          previous: queryClient.getQueryData<UserPreferences>(
            getPreferencesQueryId
          ),
          updates: [],
        };
        overlaps.set(queryClient, overlap);
      }
      const update: Update = { preferences: newPrefs, status: "pending" };
      overlap.updates.push(update);
      queryClient.setQueryData(getPreferencesQueryId, newPrefs);
      const query = queryClient
        .getQueryCache()
        .find({ queryKey: getPreferencesQueryId });
      return { overlap, update, query };
    },
    onSuccess: (_data, _newPrefs, context) => {
      context.update.status = "success";
    },
    onError: (_error, _newPrefs, context) => {
      if (!context) return;
      context.update.status = "error";
      if (
        queryClient
          .getQueryCache()
          .find({ queryKey: getPreferencesQueryId }) !== context.query
      )
        return;
      const latest = context.overlap.updates.findLast(
        (update) => update.status !== "error"
      );
      const restored = latest?.preferences ?? context.overlap.previous;
      if (restored) queryClient.setQueryData(getPreferencesQueryId, restored);
      else queryClient.removeQueries({ queryKey: getPreferencesQueryId });
    },
    onSettled: (_data, _error, _newPrefs, context) => {
      if (
        context?.overlap.updates.some((update) => update.status === "pending")
      )
        return;
      overlaps.delete(queryClient);
      if (
        context &&
        queryClient
          .getQueryCache()
          .find({ queryKey: getPreferencesQueryId }) !== context.query
      )
        return;
      return queryClient.invalidateQueries({ queryKey: getPreferencesQueryId });
    },
  });
}
