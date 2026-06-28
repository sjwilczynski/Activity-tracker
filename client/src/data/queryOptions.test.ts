import { describe, expect, it } from "vitest";
import { activitiesWithLimitQueryOptions } from "./queryOptions";

describe("activitiesWithLimitQueryOptions", () => {
  const getAuthToken = async () => "token";

  it("includes the limit in the query key so different limits don't collide in the cache", () => {
    expect(activitiesWithLimitQueryOptions(getAuthToken, 5).queryKey).toEqual([
      "activitiesWithLimit",
      5,
    ]);
    expect(activitiesWithLimitQueryOptions(getAuthToken, 10).queryKey).toEqual([
      "activitiesWithLimit",
      10,
    ]);
  });

  it("keeps 'activitiesWithLimit' as the key prefix so partial-key invalidation still matches", () => {
    const { queryKey } = activitiesWithLimitQueryOptions(getAuthToken, 5);
    expect(queryKey[0]).toBe("activitiesWithLimit");
  });
});
