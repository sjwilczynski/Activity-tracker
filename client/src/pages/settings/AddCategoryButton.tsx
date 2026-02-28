import { Plus } from "lucide-react";
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
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function AddCategoryButton() {
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

  const handleSubmit = () => {
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
  };

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
