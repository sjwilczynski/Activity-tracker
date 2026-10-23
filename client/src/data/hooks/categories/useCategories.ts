import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { CategoryOption } from "../../types";

export const useCategories = () => {
  const { categoriesQuery } = getRouteApi("/_authenticated").useRouteContext();
  return useQuery(categoriesQuery);
};

export const useAvailableCategories = () => {
  const { data: categories, isLoading, error, refetch } = useCategories();
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
  return { availableCategories, isLoading, error, refetch };
};
