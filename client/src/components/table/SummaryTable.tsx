import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ActivityRecordWithId } from "../../data";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { EditableTableRow } from "./EditableTableRow/EditableTableRow";

type Props = {
  records: ActivityRecordWithId[];
  totalCount: number;
};

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function groupByMonth(
  records: ActivityRecordWithId[]
): Record<string, ActivityRecordWithId[]> {
  const groups: Record<string, ActivityRecordWithId[]> = {};
  for (const record of records) {
    const year = record.date.getFullYear();
    const month = String(record.date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  }
  return groups;
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

export function SummaryTable(props: Props) {
  const { records, totalCount } = props;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!records) {
    return null;
  }

  const pageRecords = records.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const monthGroups = groupByMonth(pageRecords);
  const sortedMonthKeys = Object.keys(monthGroups).sort((a, b) =>
    b.localeCompare(a)
  );

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const rangeStart = records.length === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, records.length);

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Activities</CardTitle>
        <CardDescription>
          {records.length} of {totalCount} activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
              <ListChecks className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search query or date range
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: Month-grouped rows */}
            <div className="hidden md:block space-y-1">
              {sortedMonthKeys.map((monthKey) => (
                <div key={monthKey}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EDF3FA] dark:bg-[#253550] mb-1">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#5085BE] dark:text-[#6b9fd4]">
                      {formatMonthKey(monthKey)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({monthGroups[monthKey].length})
                    </span>
                  </div>
                  {monthGroups[monthKey].map((record) => (
                    <EditableTableRow key={record.id} record={record} />
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: Card list */}
            <div className="md:hidden space-y-3">
              {pageRecords.map((record) => (
                <EditableTableRow key={record.id} record={record} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="bg-transparent border rounded px-2 py-1 text-sm text-foreground"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {rangeStart}–{rangeEnd} of {records.length}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Go to next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
