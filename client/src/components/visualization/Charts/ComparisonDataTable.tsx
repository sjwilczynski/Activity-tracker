import {
  getComparisonBuckets,
  type ComparisonSeries,
} from "@/pages/comparison-data";

export function ComparisonDataTable({
  series,
}: {
  series: ComparisonSeries[];
}) {
  return (
    <details className="rounded-lg border px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium">
        View exact comparison data
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Activity counts by period and time bucket
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-2">
                Bucket
              </th>
              {series.map((entry) => (
                <th scope="col" className="p-2 text-right" key={entry.id}>
                  {entry.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getComparisonBuckets(series).map((bucket) => (
              <tr className="border-b last:border-0" key={bucket}>
                <th scope="row" className="p-2 font-medium">
                  {bucket}
                </th>
                {series.map((entry) => (
                  <td key={entry.id} className="p-2 text-right tabular-nums">
                    {entry.points.find((point) => point.bucket === bucket)
                      ?.count ?? "Not yet recorded"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
