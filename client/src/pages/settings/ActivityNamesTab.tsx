import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { ActivityRecordWithId, Category } from "../../data";
import { AddActivityNameButton } from "./AddActivityNameButton";
import { CategorySelect } from "./CategorySelect";
import { EditActivityNameButton } from "./EditActivityNameButton";
import { useAssignCategory } from "./useAssignCategory";

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
  const activityNames: ActivityNameInfo[] = (() => {
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
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Activity Names</CardTitle>
            <CardDescription>
              Manage activity names and assign them to categories
            </CardDescription>
          </div>
          <AddActivityNameButton categories={categories} />
        </div>
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
