import { database } from "../firebase/firebase";
import { RATE_LIMIT } from "../validation/constants";

type RateLimitData = {
  count: number;
  windowStart: number;
};

const rateLimitPath = (userId: string): string => `/rateLimit/${userId}`;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

export const checkRateLimit = async (
  userId: string
): Promise<RateLimitResult> => {
  const ref = database.ref(rateLimitPath(userId));
  const now = Date.now();

  const result = await ref.transaction(
    (currentData: RateLimitData | null): RateLimitData | null => {
      if (currentData === null) {
        return { count: 1, windowStart: now };
      }

      const windowAge = now - currentData.windowStart;
      if (windowAge >= RATE_LIMIT.WINDOW_MS) {
        return { count: 1, windowStart: now };
      }

      return {
        count: currentData.count + 1,
        windowStart: currentData.windowStart,
      };
    }
  );

  const data = result.snapshot.val() as RateLimitData;

  if (data.count > RATE_LIMIT.REQUESTS_PER_MINUTE) {
    const windowAge = now - data.windowStart;
    const retryAfterMs = RATE_LIMIT.WINDOW_MS - windowAge;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  return { allowed: true };
};

export const getRateLimitHeaders = (
  result: RateLimitResult
): Record<string, string> => {
  if (!result.allowed) {
    return {
      "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
    };
  }
  return {};
};
