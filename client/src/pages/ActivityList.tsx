import { Search } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "../components/DateRangePicker";
import { DeleteAllButton } from "../components/DeleteAllButton";
import { ExportButton } from "../components/ExportButton";
import { UploadButton } from "../components/UploadButton";
import {
  useDateRange,
  useDateRangeState,
} from "../components/forms/DateFilterForm/shared";
import { ErrorView } from "../components/states/ErrorView";
import { Loading } from "../components/states/Loading";
import { SummaryTable } from "../components/table/SummaryTable";
import { Input } from "../components/ui/input";
import {
  filterByDateRange,
  sortDescendingByDate,
  useActivities,
  useExportUserData,
  useIsFetchingActivities,
} from "../data";

export const ActivityList = () => {
  const { isLoading, error, data } = useActivities();
  const { startDate, endDate } = useDateRange();
  const [dateRange, setDateRange] = useDateRangeState();
  const [searchQuery, setSearchQuery] = useState("");

  const exportUserData = useExportUserData();
  const isFetchingActivities = useIsFetchingActivities();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const hasData = !!data?.length;

  const filtered = hasData
    ? sortDescendingByDate(filterByDateRange(data, startDate, endDate))
    : [];

  const searchFiltered = searchQuery
    ? filtered.filter((record) =>
        record.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filtered;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
            Activity History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your logged activities
          </p>
        </div>
        {hasData && (
          <DateRangePicker
            value={{ from: dateRange.startDate, to: dateRange.endDate }}
            onChange={(range) =>
              setDateRange({ startDate: range.from, endDate: range.to })
            }
          />
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasData && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search activities by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search activities"
            />
          </div>
        )}
        <div className="flex gap-2">
          {hasData && (
            <ExportButton
              disabled={isFetchingActivities}
              exportFile={exportUserData}
            />
          )}
          <UploadButton />
          {hasData && (
            <DeleteAllButton
              totalCount={data.length}
              disabled={isFetchingActivities}
            />
          )}
        </div>
      </div>

      {/* Table or Empty State */}
      {hasData ? (
        <SummaryTable records={searchFiltered} totalCount={data.length} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium text-foreground">
            No activities yet
          </p>
          <p className="mt-1">
            Upload a JSON file above or use Quick add on the homepage to get
            started 🚀
          </p>
        </div>
      )}
    </div>
  );
};
