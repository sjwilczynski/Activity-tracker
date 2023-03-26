import { styled } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DivChartContainer = styled("div")({
  position: "relative",
  minHeight: "50vh",
});

const DivSizing = styled("div")({
  minWidth: 570,
  padding: "0 2rem",
});

export const ChartWrapper = ({ children }: Props) => {
  return (
    <DivSizing>
      <DivChartContainer>{children}</DivChartContainer>
    </DivSizing>
  );
};
