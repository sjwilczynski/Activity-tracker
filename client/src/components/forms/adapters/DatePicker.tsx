import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

type DatePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  showDayOfWeek?: boolean;
  hideLabel?: boolean;
};

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  showDayOfWeek = true,
  hideLabel = false,
}: DatePickerProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const dayOfWeek =
    showDayOfWeek && value && isValid(value) ? format(value, "EEEE") : "";

  const stringValue =
    value && isValid(value) ? format(value, "yyyy-MM-dd") : "";

  return (
    <div className="space-y-1.5">
      {!hideLabel && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          type="date"
          value={stringValue}
          onChange={(e) => {
            const date = new Date(e.target.value + "T00:00:00");
            if (isValid(date)) {
              onChange(date);
            }
          }}
          onBlur={onBlur}
          aria-label={hideLabel ? label : undefined}
          className="pl-9 bg-[var(--color-input-background)]"
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={dayOfWeek ? helperId : undefined}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : dayOfWeek ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {dayOfWeek}
        </p>
      ) : null}
    </div>
  );
};
