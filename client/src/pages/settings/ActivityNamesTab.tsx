import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { ActivityRecordWithId, Category } from "../../data";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

type ActivityNameInfo = {
  name: string;
  count: number;
  categoryId: string | undefined;
};

export function ActivityNamesTab({
  activities,
  categories,
}: {
  activities: ActivityRecordWithId[];
  categories: Category[];
}) {
  const activityNames = useMemo<ActivityNameInfo[]>(() => {
    const nameMap = new Map<string, { count: number; categoryId: string }>();
    for (const activity of activities) {
      const existing = nameMap.get(activity.name);
      if (existing) {
        existing.count += 1;
      } else {
        nameMap.set(activity.name, {
          count: 1,
          categoryId: activity.categoryId,
        });
      }
    }

    return Array.from(nameMap.entries())
      .map(([name, { count, categoryId }]) => ({
        name,
        count,
        categoryId: categoryId || undefined,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Names</CardTitle>
        <CardDescription>
          Manage activity names and assign them to categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activityNames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No activities yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use{" "}
              <Link to="/welcome" className="font-medium text-primary">
                Quick add
              </Link>{" "}
              or{" "}
              <Link to="/activity-list" className="font-medium text-primary">
                upload a file
              </Link>{" "}
              to get started
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Name</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityNames.map(({ name, count, categoryId }) => (
                    <ActivityNameRow
                      key={name}
                      name={name}
                      count={count}
                      categoryId={categoryId}
                      categories={categories}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {activityNames.map(({ name, count, categoryId }) => (
                <ActivityNameCard
                  key={name}
                  name={name}
                  count={count}
                  categoryId={categoryId}
                  categories={categories}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type ActivityNameRowProps = {
  name: string;
  count: number;
  categoryId: string | undefined;
  categories: Category[];
};

function useAssignCategory({ name }: Pick<ActivityNameRowProps, "name">) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();

  const handleAssignCategory = (newCategoryId: string) => {
    fetcher.submit(
      {
        intent: "assign-category",
        activityName: name,
        categoryId: newCategoryId,
      },
      { method: "post" }
    );
  };

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: `Category updated for "${name}"`,
      errorMessage: `Failed to assign category for "${name}"`,
    }
  );

  return { handleAssignCategory, isPending: fetcher.state !== "idle" };
}

function CategorySelect({
  categoryId,
  categories,
  onValueChange,
  className,
  disabled,
}: {
  categoryId: string | undefined;
  categories: Category[];
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={categoryId ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name} ({cat.active ? "active" : "inactive"})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ActivityNameRow({
  name,
  count,
  categoryId,
  categories,
}: ActivityNameRowProps) {
  const { handleAssignCategory, isPending } = useAssignCategory({ name });

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{name}</TableCell>
      <TableCell>{count}</TableCell>
      <TableCell>
        <CategorySelect
          categoryId={categoryId}
          categories={categories}
          onValueChange={handleAssignCategory}
          className="w-[180px]"
          disabled={isPending}
        />
      </TableCell>
      <TableCell className="text-right">
        <EditActivityNameButton activityName={name} />
      </TableCell>
    </TableRow>
  );
}

function ActivityNameCard({
  name,
  count,
  categoryId,
  categories,
}: ActivityNameRowProps) {
  const { handleAssignCategory, isPending } = useAssignCategory({ name });

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{name}</span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{count}×</span>
          <EditActivityNameButton activityName={name} />
        </div>
      </div>
      <CategorySelect
        categoryId={categoryId}
        categories={categories}
        onValueChange={handleAssignCategory}
        className="w-full"
        disabled={isPending}
      />
    </div>
  );
}

function EditActivityNameButton({ activityName }: { activityName: string }) {
  const [newName, setNewName] = useState(activityName);
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isPending = fetcher.state !== "idle";
  const closeRef = useRef<HTMLButtonElement>(null);

  const isValid = newName.trim().length > 0 && newName.trim() !== activityName;

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: `Renamed "${activityName}" successfully`,
      errorMessage: `Failed to rename "${activityName}"`,
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const handleSubmit = () => {
    fetcher.submit(
      {
        intent: "rename-activity",
        oldName: activityName,
        newName: newName.trim(),
      },
      { method: "post" }
    );
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) setNewName(activityName);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10! hover:text-primary! hover:scale-110 active:scale-95 transition-all duration-150"
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity Name</DialogTitle>
          <DialogDescription>
            This will update all activities with the name &quot;{activityName}
            &quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${activityName}`}>
              New Activity Name
            </Label>
            <Input
              id={`edit-name-${activityName}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending && isValid) handleSubmit();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={!isValid || isPending} onClick={handleSubmit}>
            {isPending ? "Updating..." : "Update Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
