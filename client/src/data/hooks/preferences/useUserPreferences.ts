import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { preferencesQueryOptions } from "../../queryOptions";
import {
  getPreferencesQueryId,
  preferencesApiPath,
} from "../../react-query-config/query-constants";
import type { UserPreferences } from "../../types";
import { useRequestConfig } from "../useRequestConfig";

export const useUserPreferences = () => {
  const getConfig = useRequestConfig();
  const getAuthToken = async () => (await getConfig())["x-auth-token"];
  return useQuery(preferencesQueryOptions(getAuthToken));
};

export const useUpdatePreferences = () => {
  const getConfig = useRequestConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPrefs: UserPreferences) => {
      const config = await getConfig();
      const response = await fetch(preferencesApiPath, {
        method: "PUT",
        headers: {
          "x-auth-token": config["x-auth-token"],
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrefs),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({
        queryKey: [...getPreferencesQueryId],
      });
      const previous = queryClient.getQueryData<UserPreferences>([
        ...getPreferencesQueryId,
      ]);
      queryClient.setQueryData([...getPreferencesQueryId], newPrefs);
      return { previous };
    },
    onError: (_err, _newPrefs, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...getPreferencesQueryId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...getPreferencesQueryId],
      });
    },
  });
};

export const useGroupByCategory = (): [boolean, (val: boolean) => void] => {
  const { data } = useUserPreferences();
  const { mutate } = useUpdatePreferences();

  const groupByCategory = data?.groupByCategory ?? true;
  const setGroupByCategory = (val: boolean) => {
    if (data) {
      mutate({ ...data, groupByCategory: val });
    }
  };

  return [groupByCategory, setGroupByCategory];
};

export const useFunAnimations = (): [boolean, (val: boolean) => void] => {
  const { data } = useUserPreferences();
  const { mutate } = useUpdatePreferences();

  const funAnimations = data?.funAnimations ?? true;
  const setFunAnimations = (val: boolean) => {
    if (data) {
      mutate({ ...data, funAnimations: val });
    }
  };

  return [funAnimations, setFunAnimations];
};

export const useIsLightTheme = (): boolean => {
  const { data } = useUserPreferences();
  return data?.isLightTheme ?? true;
};

export const useSetIsLightTheme = (): ((val: boolean) => void) => {
  const { data } = useUserPreferences();
  const { mutate } = useUpdatePreferences();

  return (val: boolean) => {
    if (data) {
      mutate({ ...data, isLightTheme: val });
    }
  };
};
