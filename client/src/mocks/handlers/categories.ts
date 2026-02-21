import { delay, http, HttpResponse } from "msw";
import type { Category } from "../../data/types";
import { mockCategories } from "../data/categories";

let categories: Category[] = mockCategories.map((c) => ({
  ...c,
  activityNames: [...c.activityNames],
}));

/** Get the current mutable categories (used by activity handlers) */
export const getCategories = (): Category[] => categories;

/** Replace categories state immutably (used by activity handlers) */
export const setCategories = (newCategories: Category[]) => {
  categories = newCategories;
};

/** Reset categories to initial state (useful between tests) */
export const resetCategories = () => {
  categories = mockCategories.map((c) => ({
    ...c,
    activityNames: [...c.activityNames],
  }));
};

export const categoryHandlers = [
  // GET api/categories
  http.get("*/api/categories", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(categories);
  }),

  // POST api/categories
  http.post("*/api/categories", async ({ request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const body = (await request.json()) as Omit<Category, "id">;
    const newCategory: Category = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      ...body,
    };
    categories = [...categories, newCategory];
    return new HttpResponse(null, { status: 200 });
  }),

  // PUT api/categories/:id
  http.put("*/api/categories/:id", async ({ params, request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const { id } = params;
    const body = (await request.json()) as Omit<Category, "id">;
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    categories = categories.map((c) =>
      c.id === id ? { id: id as string, ...body } : c
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE api/categories/:id
  http.delete("*/api/categories/:id", async ({ params, request }) => {
    await delay(100);

    const authHeader = request.headers.get("x-auth-token");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }

    const { id } = params;
    categories = categories.filter((c) => c.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // POST api/categories/:categoryId/activity-names
  http.post(
    "*/api/categories/:categoryId/activity-names",
    async ({ params, request }) => {
      await delay(100);

      const authHeader = request.headers.get("x-auth-token");
      if (!authHeader) {
        return new HttpResponse(null, { status: 401 });
      }

      const { categoryId } = params;
      const { activityName } = (await request.json()) as {
        activityName: string;
      };

      // Check not already in another category
      for (const cat of categories) {
        if (cat.activityNames.includes(activityName)) {
          if (cat.id === categoryId) {
            return new HttpResponse(null, { status: 200 }); // already there
          }
          return new HttpResponse(
            `Activity name "${activityName}" already belongs to category "${cat.name}"`,
            { status: 400 }
          );
        }
      }

      const target = categories.find((c) => c.id === categoryId);
      if (!target) {
        return new HttpResponse("Category not found", { status: 404 });
      }

      categories = categories.map((c) =>
        c.id === categoryId
          ? { ...c, activityNames: [...c.activityNames, activityName] }
          : c
      );
      return new HttpResponse(null, { status: 200 });
    }
  ),
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
