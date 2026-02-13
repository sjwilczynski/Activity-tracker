import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const ChartWrapper = ({ children }: Props) => {
  return (
    <div className="min-w-[570px] px-8">
      <div className="relative min-h-[50vh]">{children}</div>
    </div>
  );
};
