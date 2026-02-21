import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "../../queryOptions";
import type { CategoryOption } from "../../types";
import { useRequestConfig } from "../useRequestConfig";

export const useCategories = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  return useQuery(categoriesQueryOptions(getAuthToken));
};

export const useAvailableCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const availableCategories = (categories ?? []).reduce<CategoryOption[]>(
    (acc, category) => {
      for (const activityName of category.activityNames ?? []) {
        acc.push({
          name: activityName,
          categoryName: category.name,
          categoryId: category.id,
          active: category.active,
        });
      }
      return acc;
    },
    []
  );
  return { availableCategories, isLoading };
};
