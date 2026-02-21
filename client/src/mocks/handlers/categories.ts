import { delay, http, HttpResponse } from "msw";
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

  // DELETE api/categories/:id
  http.delete("*/api/categories/:id", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return new HttpResponse(null, { status: 204 });
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
