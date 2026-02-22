import { Plus } from "lucide-react";
import { useRef, useState } from "react";
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

export function AddActivityNameButton({
  categories,
}: {
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const isPending = fetcher.state !== "idle";
  const closeRef = useRef<HTMLButtonElement>(null);

  const isValid = name.trim().length > 0 && categoryId.length > 0;

  useFeedbackToast(
    {
      isSuccess: fetcher.state === "idle" && fetcher.data?.ok === true,
      isError: fetcher.state === "idle" && fetcher.data?.error !== undefined,
    },
    {
      successMessage: "Activity name added successfully!",
      errorMessage: "Failed to add activity name",
      onSuccess: () => closeRef.current?.click(),
    }
  );

  const handleSubmit = () => {
    if (!isValid) return;
    fetcher.submit(
      {
        intent: "add-activity-name",
        activityName: name.trim(),
        categoryId,
      },
      { method: "POST" }
    );
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setName("");
          setCategoryId(categories[0]?.id ?? "");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Activity Name
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Activity Name</DialogTitle>
          <DialogDescription>
            Add a new activity name and assign it to a category
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-activity-name">Activity Name</Label>
            <Input
              id="new-activity-name"
              placeholder="e.g., Running, Swimming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPending && isValid) handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-activity-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="new-activity-category">
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
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" ref={closeRef}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending || !isValid}>
            {isPending ? "Adding..." : "Add Activity Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
