import { useQuery } from "@tanstack/react-query";
import {
  categoriesApiPath,
  getCategoriesQueryId,
} from "../../react-query-config/query-constants";
import type { Category, CategoryOption } from "../../types";
import type { HeadersPromise } from "../useRequestConfig";
import { useRequestConfig } from "../useRequestConfig";

export const useCategories = () => {
  const getConfig = useRequestConfig();
  return useQuery<Category[], Error>({
    queryKey: getCategoriesQueryId,
    queryFn: () => fetchCategories(getConfig()),
  });
};

const fetchCategories = async (
  headersPromise: HeadersPromise
): Promise<Category[]> => {
  const headers = await headersPromise;

  const response = await fetch(categoriesApiPath, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as Category[];
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
