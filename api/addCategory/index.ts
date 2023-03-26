import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserId } from "../authorization";
import { database } from "../database";
import type { Category, Subcategory } from "../utils/types";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const category = req.body;
  const idToken = req.headers["x-auth-token"];
  let userId: string;
  try {
    userId = await getUserId(idToken);
  } catch (err) {
    context.res = { status: 401, body: (err as Error).message };
    return;
  }

  if (isCategoryValid(category)) {
    try {
      await database.addCategory(userId, category);
      context.res = {
        body: "Successfully added",
      };
    } catch (err) {
      context.res = {
        status: 500,
        body: (err as Error).message,
      };
    }
  } else {
    context.res = {
      status: 500,
      body: "Category is invalid",
    };
  }
};

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

export default httpTrigger;
