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
      if (category.subcategories?.length) {
        category.subcategories.forEach((subcategory) =>
          acc.push({
            name: subcategory.name,
            categoryName: category.name,
            active: category.active,
          })
        );
      } else {
        acc.push({
          name: category.name,
          categoryName: category.name,
          active: category.active,
        });
      }
      return acc;
    },
    []
  );
  return { availableCategories, isLoading };
};
