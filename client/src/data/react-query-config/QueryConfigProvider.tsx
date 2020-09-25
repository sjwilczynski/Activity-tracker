import * as React from "react";
import { QueryCache, ReactQueryCacheProvider } from "react-query";

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
    },
  },
});

export const QueryConfigProvider = (props: { children: React.ReactNode }) => {
  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      {props.children}
    </ReactQueryCacheProvider>
  );
};
