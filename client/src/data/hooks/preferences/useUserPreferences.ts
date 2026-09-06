import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useRequestConfig } from "../useRequestConfig";
import { updatePreferencesMutationOptions } from "./preference-mutations";

export const useUserPreferences = () => {
  const { preferencesQuery } = getRouteApi("/_authenticated").useRouteContext();
  return useQuery(preferencesQuery);
};

export const useUpdatePreferences = () => {
  const getConfig = useRequestConfig();
  const queryClient = useQueryClient();

  return useMutation(
    updatePreferencesMutationOptions({
      queryClient,
      getAuthToken: async () => (await getConfig())["x-auth-token"],
    })
  );
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
