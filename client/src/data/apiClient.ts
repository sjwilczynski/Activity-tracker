export type GetAuthToken = () => Promise<string>;

type ApiFetchOptions = RequestInit & {
  /**
   * When true the response is returned even on a non-ok status, so the caller
   * can inspect `response.ok` itself (e.g. to fall back to a default value or
   * build its own error result). Defaults to false, which throws on non-ok.
   */
  allowNotOk?: boolean;
};

/**
 * Thin `fetch` wrapper that injects the `x-auth-token` header from
 * `getAuthToken` and centralizes the repeated non-ok handling. Throws on a
 * non-ok response by default; pass `allowNotOk: true` to handle the status
 * manually.
 */
export async function apiFetch(
  getAuthToken: GetAuthToken,
  input: string,
  { allowNotOk = false, headers, ...init }: ApiFetchOptions = {}
): Promise<Response> {
  const token = await getAuthToken();

  const requestHeaders = new Headers(headers);
  requestHeaders.set("x-auth-token", token);

  const response = await fetch(input, {
    ...init,
    headers: requestHeaders,
  });

  if (!allowNotOk && !response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
