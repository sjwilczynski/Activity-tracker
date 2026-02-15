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
        defaultValue="categories"
        className="space-y-4 max-w-4xl flex-col"
        orientation={isMobile ? "vertical" : "horizontal"}
      >
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activities">Activity Names</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="animate-in fade-in-0 duration-200">
          <CategoriesTab categories={categories} />
        </TabsContent>

        <TabsContent value="activities" className="animate-in fade-in-0 duration-200">
          <ActivityNamesTab activities={activities} categories={categories} />
        </TabsContent>

        <TabsContent value="appearance" className="animate-in fade-in-0 duration-200">
          <AppearanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
