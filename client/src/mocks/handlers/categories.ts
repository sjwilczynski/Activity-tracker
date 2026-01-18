import { http, HttpResponse, delay } from "msw";
import { mockCategories } from "../data/categories";

export const categoryHandlers = [
  // GET api/categories
  http.get("*/api/categories", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(mockCategories);
  }),
];

// Error scenario handlers for testing
export const categoryErrorHandlers = {
  networkError: http.get("*/api/categories", () => {
    return HttpResponse.error();
  }),
  serverError: http.get("*/api/categories", () => {
    return new HttpResponse(null, { status: 500 });
  }),
};
