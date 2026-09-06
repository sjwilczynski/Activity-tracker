import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { format } from "date-fns";
import { afterEach, describe, expect, it, vi } from "vitest";
import { activitiesQueryOptions } from "./queryOptions";

describe("activity date-only API values", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  it.each([
    "2021-01-01",
    "2024-03-10",
    "2024-03-31",
    "2024-10-27",
    "2024-11-03",
  ])(
    "keeps %s at local midnight through fetch and serialization",
    async (date) => {
      vi.stubGlobal("window", { location: { origin: "http://localhost" } });
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            Response.json([
              { id: "date-test", name: "Running", active: true, date },
            ])
          )
      );
      const observer = new QueryObserver(
        queryClient,
        activitiesQueryOptions(async () => "token")
      );

      const result = await observer.refetch();
      const activityDate = result.data?.[0].date;

      expect(result.error).toBeNull();
      expect(activityDate).toBeInstanceOf(Date);
      expect(activityDate?.getHours()).toBe(0);
      expect(activityDate && format(activityDate, "yyyy-MM-dd")).toBe(date);
      observer.destroy();
    }
  );
});
