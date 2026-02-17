import { format, isValid } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

function toDateString(date: Date | null): string {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
}

function fromDateString(str: string): Date | null {
  if (!str) return null;
  const date = new Date(str + "T00:00:00");
  return isValid(date) ? date : null;
}

function formatDateRange(range: DateRange): string {
  if (!range.from && !range.to) return "All time";
  const fromStr =
    range.from && isValid(range.from)
      ? range.from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Start";
  const toStr =
    range.to && isValid(range.to)
      ? range.to.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "End";
  return `${fromStr} – ${toStr}`;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(toDateString(value.from));
  const [localTo, setLocalTo] = useState(toDateString(value.to));

  const handleOpen = (open: boolean) => {
    if (open) {
      setLocalFrom(toDateString(value.from));
      setLocalTo(toDateString(value.to));
    }
    setIsOpen(open);
  };

  const applyPreset = (preset: "week" | "month" | "year") => {
    const to = new Date();
    const from = new Date();

    switch (preset) {
      case "week":
        from.setDate(from.getDate() - 7);
        break;
      case "month":
        from.setMonth(from.getMonth() - 1);
        break;
      case "year":
        from.setFullYear(from.getFullYear() - 1);
        break;
    }

    onChange({ from, to });
    setIsOpen(false);
  };

  const applyCustomRange = () => {
    onChange({ from: fromDateString(localFrom), to: fromDateString(localTo) });
    setIsOpen(false);
  };

  const fromDate = fromDateString(localFrom);
  const toDate = fromDateString(localTo);
  const isInvalidRange =
    localFrom !== "" &&
    localTo !== "" &&
    !!fromDate &&
    !!toDate &&
    fromDate.getTime() > toDate.getTime();

  const clearRange = () => {
    onChange({ from: null, to: null });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal"
        >
          <Calendar className="mr-2 size-4" />
          {formatDateRange(value)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>
            Choose a preset or select custom dates
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-3">Quick Presets</h4>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("week")}
                className="justify-start"
              >
                Last Week
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("month")}
                className="justify-start"
              >
                Last Month
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("year")}
                className="justify-start"
              >
                Last Year
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Custom Range</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="date-range-from">From</Label>
                <Input
                  id="date-range-from"
                  type="date"
                  value={localFrom}
                  onChange={(e) => setLocalFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-range-to">To</Label>
                <Input
                  id="date-range-to"
                  type="date"
                  value={localTo}
                  onChange={(e) => setLocalTo(e.target.value)}
                />
              </div>
              {isInvalidRange && (
                <p
                  className="text-xs text-destructive animate-field-shake"
                  role="alert"
                >
                  Start date must be before end date
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {(value.from || value.to) && (
            <Button
              variant="ghost"
              onClick={clearRange}
              className="mr-auto text-muted-foreground"
            >
              Clear
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={applyCustomRange}
            disabled={isInvalidRange}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
