import axios from "axios";
import { useQuery } from "react-query";
import {
  getCategoriesQueryId,
  categoriesApiPath,
} from "../../react-query-config/query-constants";
import type { Category, CategoryOption } from "../../types";
import type { ConfigPromise } from "../useRequestConfig";
import { useRequestConfig } from "../useRequestConfig";

export const useCategories = () => {
  const getConfig = useRequestConfig();
  return useQuery<Category[], Error>(getCategoriesQueryId, () =>
    fetchCategories(getConfig())
  );
};

const fetchCategories = async (
  configPromise: ConfigPromise
): Promise<Category[]> => {
  const config = await configPromise;
  const categoriesResponse = await axios.get<Category[]>(
    categoriesApiPath,
    config
  );
  return categoriesResponse.data;
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
