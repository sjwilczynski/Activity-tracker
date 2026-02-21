import { Pencil } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
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
                      activities={activities}
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
                  activities={activities}
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
  activities: ActivityRecordWithId[];
};

function useAssignCategory({ name }: Pick<ActivityNameRowProps, "name">) {
  // TODO: CP8 — needs a bulk assign endpoint (POST /api/activities/assign-category)
  // Currently disabled: multiple fetcher.submit() calls cancel each other
  const handleAssignCategory = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_newCategoryId: string) => {
      console.warn(
        `Category assignment for "${name}" requires bulk API — coming in CP8`
      );
    },
    [name]
  );

  return handleAssignCategory;
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
      value={categoryId ?? "none"}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="No category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No category</SelectItem>
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
  const handleAssignCategory = useAssignCategory({ name });

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
          disabled
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
  const handleAssignCategory = useAssignCategory({ name });

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
        disabled
      />
    </div>
  );
}

function EditActivityNameButton({ activityName }: { activityName: string }) {
  const [newName, setNewName] = useState(activityName);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setNewName(activityName);
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
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Bulk rename requires a new API endpoint — coming soon.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled>Update Name</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
