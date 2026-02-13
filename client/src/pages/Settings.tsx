import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActivities } from "../data/hooks/activities/useActivities";
import { useCategories } from "../data/hooks/categories/useCategories";
import { ActivityNamesTab } from "./settings/ActivityNamesTab";
import { CategoriesTab } from "./settings/CategoriesTab";
import { ChartsTab } from "./settings/ChartsTab";

export const Settings = () => {
  const { data: categories = [] } = useCategories();
  const { data: activities = [] } = useActivities();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold heading-gradient">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your categories and activity types
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4 max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="activities">Activity Names</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesTab categories={categories} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivityNamesTab activities={activities} categories={categories} />
        </TabsContent>

        <TabsContent value="charts">
          <ChartsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
