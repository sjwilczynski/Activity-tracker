import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { useAuth } from "../auth";
import {
  defaultCategories,
  type DefaultCategory,
} from "../data/defaultCategories";
import { getCategoriesQueryId } from "../data/react-query-config/query-constants";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

type CategorySelection = {
  selected: boolean;
  activityNames: Set<string>;
};

function buildInitialSelection() {
  const map = new Map<string, CategorySelection>();
  for (const cat of defaultCategories) {
    map.set(cat.name, {
      selected: cat.active,
      activityNames: new Set(cat.active ? cat.activityNames : []),
    });
  }
  return map;
}

function CategoryRow({
  category,
  selection,
  onToggleCategory,
  onToggleActivity,
}: {
  category: DefaultCategory;
  selection: CategorySelection;
  onToggleCategory: (name: string) => void;
  onToggleActivity: (categoryName: string, activityName: string) => void;
}) {
  return (
    <Collapsible>
      <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
        <Checkbox
          id={`cat-${category.name}`}
          checked={selection.selected}
          onCheckedChange={() => onToggleCategory(category.name)}
        />
        <CollapsibleTrigger className="flex flex-1 items-center justify-between">
          <div className="text-left">
            <label
              htmlFor={`cat-${category.name}`}
              className="text-sm font-medium cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {category.name}
            </label>
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="ml-9 mt-1 mb-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
          {category.activityNames.map((name) => (
            <label
              key={name}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
            >
              <Checkbox
                checked={selection.activityNames.has(name)}
                disabled={!selection.selected}
                onCheckedChange={() =>
                  onToggleActivity(category.name, name)
                }
              />
              {name}
            </label>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function OnboardingCard({ onSkip }: { onSkip: () => void }) {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState(buildInitialSelection);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = useCallback((name: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(name);
      if (!current) return prev;
      const cat = defaultCategories.find((c) => c.name === name);
      if (!cat) return prev;
      const nowSelected = !current.selected;
      next.set(name, {
        selected: nowSelected,
        activityNames: nowSelected ? new Set(cat.activityNames) : new Set(),
      });
      return next;
    });
  }, []);

  const toggleActivity = useCallback(
    (categoryName: string, activityName: string) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = next.get(categoryName);
        if (!current) return prev;
        const names = new Set(current.activityNames);
        if (names.has(activityName)) {
          names.delete(activityName);
        } else {
          names.add(activityName);
        }
        next.set(categoryName, { ...current, activityNames: names });
        return next;
      });
    },
    []
  );

  const selectedCount = [...selections.values()].filter(
    (s) => s.selected && s.activityNames.size > 0
  ).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await getIdToken?.();
      const categoriesToCreate = defaultCategories.filter((cat) => {
        const sel = selections.get(cat.name);
        return sel?.selected && sel.activityNames.size > 0;
      });

      const results = await Promise.allSettled(
        categoriesToCreate.map((cat) => {
          const sel = selections.get(cat.name)!;
          return fetch("/api/categories", {
            method: "POST",
            headers: {
              "x-auth-token": token ?? "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: cat.name,
              active: cat.active,
              description: cat.description,
              activityNames: [...sel.activityNames],
            }),
          });
        })
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        console.error(`${failed} categories failed to create`);
      }

      await queryClient.invalidateQueries({
        queryKey: [...getCategoriesQueryId],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-fade-slide-up">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-6 text-primary" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">
          Welcome! Set up your activities
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick the categories and activities you want to track. You can always
          customize these later in Settings.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {defaultCategories.map((cat) => {
          const sel = selections.get(cat.name) ?? {
            selected: false,
            activityNames: new Set<string>(),
          };
          return (
            <CategoryRow
              key={cat.name}
              category={cat}
              selection={sel}
              onToggleCategory={toggleCategory}
              onToggleActivity={toggleActivity}
            />
          );
        })}

        <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? "category" : "categories"}{" "}
            selected
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedCount === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
