import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CategoryOption } from "../../../data";
import { useAvailableCategories } from "../../../data";
import { cn } from "../../../utils/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

type CategoryAutocompleteProps = {
  value: CategoryOption;
  onChange: (value: CategoryOption) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  autoFocus?: boolean;
  hideLabel?: boolean;
};

export const CategoryAutocomplete = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  autoFocus,
  hideLabel = false,
}: CategoryAutocompleteProps) => {
  const { availableCategories, isLoading } = useAvailableCategories();
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => triggerRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Group options by categoryName
  const grouped = availableCategories.reduce<Record<string, CategoryOption[]>>(
    (acc, option) => {
      const group = option.categoryName || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-1.5">
      {!hideLabel && <Label htmlFor={id}>{label}</Label>}
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) onBlur();
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={hideLabel ? label : undefined}
            aria-invalid={!!error}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-[var(--color-input-background)] px-3 py-2 text-sm shadow-xs",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value.name && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {value.name || "Search activities..."}
            </span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder="Search activities..." />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  <CommandEmpty>No activity found.</CommandEmpty>
                  {Object.entries(grouped).map(([groupName, options]) => {
                    const renderItem = (option: CategoryOption) => (
                      <CommandItem
                        key={option.name}
                        value={option.name}
                        onSelect={() => {
                          onChange(option);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            value.name === option.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.name}
                      </CommandItem>
                    );

                    if (options.length === 1) {
                      return renderItem(options[0]);
                    }

                    return (
                      <CommandGroup key={groupName} heading={groupName}>
                        {options.map(renderItem)}
                      </CommandGroup>
                    );
                  })}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
