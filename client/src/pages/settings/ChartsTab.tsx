import { BarChart3 } from "lucide-react";
import { useGroupByCategory } from "../../components/styles/StylesProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";

export function ChartsTab() {
  const [groupByCategory, setGroupByCategory] = useGroupByCategory();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Settings</CardTitle>
        <CardDescription>
          Configure how your activity data is visualized
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <Label htmlFor="group-by-category" className="font-medium">
                Group by category
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {groupByCategory
                ? "Charts show category-grouped stacked bars and multi-ring pie chart"
                : "Charts show individual bars and single-ring pie chart per activity"}
            </p>
          </div>
          <button
            id="group-by-category"
            role="switch"
            aria-checked={groupByCategory}
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              groupByCategory ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                groupByCategory ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
