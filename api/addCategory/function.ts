import { app, type HttpRequest, type HttpResponseInit } from "@azure/functions";
import { getUserId } from "../authorization/firebaseAuthorization";
import { firebaseDB as database } from "../database/firebaseDB";
import type { Category, Subcategory } from "../utils/types";

async function addCategory(request: HttpRequest): Promise<HttpResponseInit> {
  let category: unknown;
  try {
    category = await request.json();
  } catch (e) {
    return { status: 400, body: "Invalid JSON body" };
  }
  const idToken = request.headers.get("x-auth-token");
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    return { status: 401, body: (err as Error).message };
  }

  if (isCategoryValid(category)) {
    try {
      await database.addCategory(userId, category);
      return {
        status: 200,
        body: "Successfully added",
      };
    } catch (err) {
      return {
        status: 500,
        body: (err as Error).message,
      };
    }
  } else {
    return {
      status: 400,
      body: "Category data is invalid",
    };
  }
}

const isCategoryValid = (category: unknown): category is Category => {
  if (category === null || category === undefined) {
    return false;
  }

  const castedCatgeory = category as Category;
  const { name, active, description, subcategories } = castedCatgeory;
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof active !== "boolean" ||
    !Array.isArray(subcategories)
  ) {
    return false;
  }
  return subcategories.every(isSubcategoryValid);
};

const isSubcategoryValid = (
  subcategory: unknown
): subcategory is Subcategory => {
  const castedSubcategory = subcategory as Subcategory;
  if (castedSubcategory == null || castedSubcategory === undefined) {
    return false;
  }

  const { name, description } = castedSubcategory;
  if (typeof name !== "string" || typeof description !== "string") {
    return false;
  }

  return true;
};

app.http("addCategory", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "categories",
  handler: addCategory,
});
