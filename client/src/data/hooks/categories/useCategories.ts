import axios from "axios";
import { useQuery } from "react-query";
import {
  getCategoriesQueryId,
  categoriesApiPath,
} from "../../react-query-config/query-constants";
import type { Category } from "../../types";
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
