import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Category } from "../../data";
import { useFeedbackToast } from "../../hooks/useFeedbackToast";

export function DeleteCategoryButton({
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
