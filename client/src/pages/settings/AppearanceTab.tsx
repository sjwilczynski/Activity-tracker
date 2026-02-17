import { BarChart3, Sparkles } from "lucide-react";
import {
  useFunAnimations,
  useGroupByCategory,
} from "../../components/styles/StylesProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";

export function AppearanceTab() {
  const [groupByCategory, setGroupByCategory] = useGroupByCategory();
  const [funAnimations, setFunAnimations] = useFunAnimations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize charts and visual preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <Label htmlFor="fun-animations" className="font-medium">
                Fun animations
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {funAnimations
                ? "Celebration effect plays when you log an activity"
                : "No extra animations on actions"}
            </p>
          </div>
          <button
            id="fun-animations"
            role="switch"
            aria-checked={funAnimations}
            onClick={() => setFunAnimations(!funAnimations)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              funAnimations ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                funAnimations ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
