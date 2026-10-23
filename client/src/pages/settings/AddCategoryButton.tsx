import { Plus } from "lucide-react";
import { useState } from "react";
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
import { useAddCategory } from "../../data/mutations";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function AddCategoryButton() {
  const [name, setName] = useState("");
  const [active, setActive] = useState<"active" | "inactive">("active");
  const [open, setOpen] = useState(false);
  const mutation = useAddCategory();
  const { isPending: isSubmitting } = mutation;

  useFeedbackToast(mutation, {
    successMessage: "Category added successfully!",
    errorMessage: "Failed to add category",
    onSuccess: () => setOpen(false),
  });

  const handleSubmit = () => {
    if (!name.trim() || isSubmitting) return;
    mutation.mutate({
      name: name.trim(),
      active: active === "active",
      description: "",
      activityNames: [],
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && !isSubmitting) {
          mutation.reset();
          setName("");
          setActive("active");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" disabled={isSubmitting}>
          <Plus className="size-4 mr-2" />
          {isSubmitting ? "Adding..." : "Add Category"}
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
