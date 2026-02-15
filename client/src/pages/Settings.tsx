import { useCallback, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActivities } from "../data/hooks/activities/useActivities";
import { useCategories } from "../data/hooks/categories/useCategories";
import { useIsMobile } from "../hooks/use-mobile";
import { ActivityNamesTab } from "./settings/ActivityNamesTab";
import { CategoriesTab } from "./settings/CategoriesTab";
import { AppearanceTab } from "./settings/AppearanceTab";

export const Settings = () => {
  const { data: categories = [] } = useCategories();
  const { data: activities = [] } = useActivities();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("categories");

  const handleTabChange = useCallback((value: string) => {
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      setActiveTab(value);
      return;
    }

    document.documentElement.classList.add("tab-transitioning");

    const transition = (
      document as unknown as {
        startViewTransition: (cb: () => void) => {
          finished: Promise<void>;
        };
      }
    ).startViewTransition(() => {
      setActiveTab(value);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("tab-transitioning");
    });
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your categories and activity types
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4 max-w-4xl flex-col"
        orientation={isMobile ? "vertical" : "horizontal"}
      >
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activities">Activity Names</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <div style={{ viewTransitionName: "tab-content" }}>
          <TabsContent value="categories">
            <CategoriesTab categories={categories} />
          </TabsContent>

          <TabsContent value="activities">
            <ActivityNamesTab activities={activities} categories={categories} />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
