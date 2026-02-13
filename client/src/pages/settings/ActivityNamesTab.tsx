import { Pencil } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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

/** Find the category that an activity belongs to (by name or subcategory match) */
function findCategoryForActivity(
  activityName: string,
  categories: Category[]
): Category | undefined {
  return categories.find(
    (c) =>
      c.name.toLowerCase() === activityName.toLowerCase() ||
      c.subcategories?.some(
        (s) => s.name.toLowerCase() === activityName.toLowerCase()
      )
  );
}

export function ActivityNamesTab({
  activities,
  categories,
}: {
  activities: ActivityRecordWithId[];
  categories: Category[];
}) {
  const activityNames = useMemo<ActivityNameInfo[]>(() => {
    const nameMap = new Map<string, number>();
    for (const activity of activities) {
      nameMap.set(activity.name, (nameMap.get(activity.name) ?? 0) + 1);
    }

    return Array.from(nameMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        categoryId: findCategoryForActivity(name, categories)?.id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activities, categories]);

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
          <div className="rounded-md border">
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
        )}
      </CardContent>
    </Card>
  );
}

function ActivityNameRow({
  name,
  count,
  categoryId,
  categories,
  activities,
}: {
  name: string;
  count: number;
  categoryId: string | undefined;
  categories: Category[];
  activities: ActivityRecordWithId[];
}) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: `Category assigned for "${name}"`,
      errorMessage: "Failed to assign category",
    }
  );

  const handleAssignCategory = useCallback(
    (newCategoryId: string) => {
      if (newCategoryId === "none") return;
      const category = categories.find((c) => c.id === newCategoryId);
      if (!category) return;

      const matching = activities.filter((a) => a.name === name);
      for (const activity of matching) {
        fetcher.submit(
          {
            intent: "edit-activity",
            id: activity.id,
            record: JSON.stringify({
              name: activity.name,
              date: activity.date.toLocaleDateString("en-CA"),
              active: category.active,
            }),
          },
          { method: "POST" }
        );
      }
    },
    [name, categories, activities, fetcher]
  );

  return (
    <TableRow>
      <TableCell className="font-medium capitalize">{name}</TableCell>
      <TableCell>{count}</TableCell>
      <TableCell>
        <Select
          value={categoryId ?? "none"}
          onValueChange={handleAssignCategory}
        >
          <SelectTrigger className="w-[180px]">
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
      </TableCell>
      <TableCell className="text-right">
        <EditActivityNameButton activityName={name} />
      </TableCell>
    </TableRow>
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
