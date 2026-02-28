import { Pencil } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "../../components/ui/button";
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
import type { Category } from "../../data";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function EditCategoryButton({ category }: { category: Category }) {
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

  const handleSubmit = () => {
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
  };

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
