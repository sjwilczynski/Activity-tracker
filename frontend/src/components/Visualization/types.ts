export type ChartJsData = {
    labels: string[];
    datasets: {
      label?: string;
      backgroundColor?: string[];
      data: number[];
      weight?: number;
      stack?: string;
      barPercentage?: number;
      type?: string;
      fill?: boolean;
      borderColor?: string;
      yAxisID?: string;
    }[];
  };