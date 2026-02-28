import { Folder } from "lucide-react";
import { Badge } from "../../components/ui/badge";
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
import type { Category } from "../../data";
import { AddCategoryButton } from "./AddCategoryButton";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import { EditCategoryButton } from "./EditCategoryButton";

export function CategoriesTab({ categories }: { categories: Category[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage activity categories (active/inactive)
            </CardDescription>
          </div>
          <AddCategoryButton />
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-12 animate-fade-slide-up">
            <Folder className="size-12 text-muted-foreground mx-auto mb-4 animate-empty-bounce" />
            <p className="text-lg font-medium">No categories yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first category to get started
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Activity Names</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      otherCategories={categories.filter(
                        (c) => c.id !== category.id
                      )}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  otherCategories={categories.filter(
                    (c) => c.id !== category.id
                  )}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityNamesBadges({ activityNames }: { activityNames: string[] }) {
  if (activityNames.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">
        No activities
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {activityNames.map((name) => (
        <Badge key={name} variant="outline" className="text-xs capitalize">
          {name}
        </Badge>
      ))}
    </div>
  );
}

function CategoryCard({
  category,
  otherCategories,
}: {
  category: Category;
  otherCategories: Category[];
}) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{category.name}</span>
        <div className="flex shrink-0 gap-1">
          <EditCategoryButton category={category} />
          <DeleteCategoryButton
            category={category}
            otherCategories={otherCategories}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={category.active ? "default" : "secondary"}>
          {category.active ? "active" : "inactive"}
        </Badge>
      </div>
      <ActivityNamesBadges activityNames={category.activityNames ?? []} />
    </div>
  );
}

function CategoryRow({
  category,
  otherCategories,
}: {
  category: Category;
  otherCategories: Category[];
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>
        <Badge variant={category.active ? "default" : "secondary"}>
          {category.active ? "active" : "inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <ActivityNamesBadges activityNames={category.activityNames ?? []} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <EditCategoryButton category={category} />
          <DeleteCategoryButton
            category={category}
            otherCategories={otherCategories}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
