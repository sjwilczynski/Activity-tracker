import { Folder, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Badge } from "../../components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
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
import type { Category } from "../../data";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

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

function ActivityNamesBadges({
  activityNames,
}: {
  activityNames: string[];
}) {
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

function AddCategoryButton() {
  const [name, setName] = useState("");
  const [active, setActive] = useState<"active" | "inactive">("active");
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isSubmitting = fetcher.state !== "idle";

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: "Category added successfully!",
      errorMessage: "Failed to add category",
    }
  );

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    fetcher.submit(
      {
        intent: "add-category",
        category: JSON.stringify({
          name: name.trim(),
          active: active === "active",
          description: "",
          activityNames: [],
        }),
      },
      { method: "POST" }
    );
    setName("");
    setActive("active");
    setOpen(false);
  }, [name, active, fetcher]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setName("");
          setActive("active");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for organizing activities
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="e.g., Sports, Fitness"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-type">Type</Label>
            <Select
              value={active}
              onValueChange={(v: "active" | "inactive") => setActive(v)}
            >
              <SelectTrigger id="category-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryButton({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [active, setActive] = useState<"active" | "inactive">(
    category.active ? "active" : "inactive"
  );
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isSubmitting = fetcher.state !== "idle";

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: "Category updated successfully!",
      errorMessage: "Failed to update category",
    }
  );

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    fetcher.submit(
      {
        intent: "edit-category",
        id: category.id,
        category: JSON.stringify({
          name: name.trim(),
          active: active === "active",
          description: category.description,
          activityNames: category.activityNames ?? [],
        }),
      },
      { method: "POST" }
    );
  }, [category, name, active, fetcher]);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setName(category.name);
          setActive(category.active ? "active" : "inactive");
        }
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update category details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-cat-name-${category.id}`}>
              Category Name
            </Label>
            <Input
              id={`edit-cat-name-${category.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-cat-type-${category.id}`}>Type</Label>
            <Select
              value={active}
              onValueChange={(v: "active" | "inactive") => setActive(v)}
            >
              <SelectTrigger id={`edit-cat-type-${category.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            >
              Save Changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryButton({
  category,
  otherCategories,
}: {
  category: Category;
  otherCategories: Category[];
}) {
  const [action, setAction] = useState<"delete" | "reassign">("delete");
  const [targetCategoryId, setTargetCategoryId] = useState<string>(
    otherCategories[0]?.id ?? ""
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isPending = fetcher.state !== "idle";

  // Sync targetCategoryId when otherCategories changes
  useEffect(() => {
    if (!otherCategories.some((c) => c.id === targetCategoryId)) {
      setTargetCategoryId(otherCategories[0]?.id ?? "");
    }
  }, [otherCategories, targetCategoryId]);

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: "Category deleted successfully!",
      errorMessage: "Failed to delete category",
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const handleDelete = () => {
    if (action === "reassign") {
      fetcher.submit(
        {
          intent: "delete-category-reassign",
          id: category.id,
          targetCategoryId,
        },
        { method: "POST" }
      );
    } else {
      fetcher.submit(
        {
          intent: "delete-category-with-activities",
          id: category.id,
        },
        { method: "POST" }
      );
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setAction("delete");
          setTargetCategoryId(otherCategories[0]?.id ?? "");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10! dark:hover:bg-red-500/15! hover:scale-110 active:scale-95 transition-all duration-150"
        >
          <Trash2 className="size-4 text-destructive dark:text-red-400" />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{category.name}&quot;?</DialogTitle>
          <DialogDescription>
            Choose what to do with activities in this category. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup
            value={action}
            onValueChange={(value) => setAction(value as "delete" | "reassign")}
            className="space-y-3"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="delete" className="mt-0.5" />
              <div>
                <p className="font-medium text-sm">
                  Delete all activities in this category
                </p>
                <p className="text-xs text-muted-foreground">
                  Permanently remove all activities assigned to &quot;
                  {category.name}&quot;
                </p>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 ${otherCategories.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <RadioGroupItem
                value="reassign"
                disabled={otherCategories.length === 0}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-sm">
                  Reassign activities to another category
                </p>
                <p className="text-xs text-muted-foreground">
                  Move all activities to a different category before deleting
                </p>
              </div>
            </label>
          </RadioGroup>
          {action === "reassign" && otherCategories.length > 0 && (
            <div className="space-y-2 pl-6">
              <Label>Target category</Label>
              <Select
                value={targetCategoryId}
                onValueChange={setTargetCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {otherCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || (action === "reassign" && !targetCategoryId)}
          >
            {isPending ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
