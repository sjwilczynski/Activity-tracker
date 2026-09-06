import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { UserData } from "../../../../shared/types";
import type { Category } from "../../data";
import { actionRouting } from "../../mocks/actionRouting";
import { setActivities } from "../../mocks/handlers/activities";
import { setCategories } from "../../mocks/handlers/categories";
import { Settings } from "../Settings";

const meta: Meta<typeof Settings> = {
  title: "Pages/Name integrity",
  component: Settings,
  parameters: { reactRouter: actionRouting("settings") },
};
export default meta;
type Story = StoryObj<typeof meta>;
const headers = { "x-auth-token": "mock-token-12345" };
const readBackup = async (): Promise<UserData> =>
  (await fetch("/api/export", { headers })).json();

export const MergeImportedNames: Story = {
  beforeEach: () => {
    setActivities([
      {
        id: "source",
        name: " Running ",
        date: "2024-02-10",
        description: "Keep me",
        timeSpent: 0,
        categoryId: "sports",
        active: true,
      },
      {
        id: "similar",
        name: "Running",
        date: "2024-02-10",
        categoryId: "",
        active: true,
      },
      {
        id: "target",
        name: " Yoga ",
        date: "2024-02-10",
        intensity: "high",
        categoryId: "wellness",
        active: true,
      },
    ]);
    setCategories([
      {
        id: "sports",
        name: "Sports",
        description: "",
        active: true,
        activityNames: [" Running "],
      },
      {
        id: "wellness",
        name: "Wellness",
        description: "",
        active: true,
        activityNames: [" Yoga "],
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByText("Sports");
    const before = await readBackup();
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));
    const row = canvas
      .getAllByRole("row")
      .find(
        (item) =>
          item.querySelector("td")?.textContent === " Running " &&
          item.offsetParent !== null
      );
    if (!row) throw new Error("Missing exact imported activity-name row");
    await userEvent.click(within(row).getByRole("button", { name: /edit/i }));
    const dialog = within(await screen.findByRole("dialog"));
    const input = dialog.getByLabelText(/new activity name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "Yoga");
    await userEvent.click(dialog.getByRole("button", { name: /update name/i }));
    expect(dialog.getByText(/1 entries.*Wellness/)).toBeInTheDocument();
    await userEvent.click(
      dialog.getByRole("button", { name: /confirm merge/i })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const after = await readBackup();
    expect(after.activities).toEqual({
      ...before.activities,
      source: { ...before.activities.source, name: " Yoga " },
    });
    expect(after.categories.sports.activityNames).toEqual([]);
    expect(after.categories.wellness.activityNames).toEqual([" Yoga "]);
  },
};

export const TrimCategoryNames: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByText("Sports");
    await userEvent.click(canvas.getByRole("button", { name: "Add Category" }));
    let dialog = within(await screen.findByRole("dialog"));
    await userEvent.type(
      dialog.getByLabelText("Category Name"),
      "  Outdoor  Sports  "
    );
    await userEvent.click(dialog.getByRole("button", { name: "Add Category" }));
    await canvas.findAllByText("Outdoor Sports");
    const categories: Category[] = await (
      await fetch("/api/categories", { headers })
    ).json();
    const added = categories.find(
      (category) => category.name === "Outdoor  Sports"
    );
    expect(added).toBeDefined();

    const row = canvas
      .getAllByRole("row")
      .find(
        (item) =>
          within(item).queryByText("Outdoor Sports") &&
          item.offsetParent !== null
      );
    if (!row) throw new Error("Missing added category");
    await userEvent.click(within(row).getByRole("button", { name: /edit/i }));
    dialog = within(await screen.findByRole("dialog"));
    const input = dialog.getByLabelText("Category Name");
    await userEvent.clear(input);
    await userEvent.type(input, "  Team Sports  ");
    await userEvent.click(
      dialog.getByRole("button", { name: /save changes/i })
    );
    await canvas.findAllByText("Team Sports");
    const saved = await readBackup();
    expect(
      Object.values(saved.categories).find(
        (category) => category.name === "Team Sports"
      )
    ).toEqual({
      name: "Team Sports",
      description: "",
      active: true,
      activityNames: [],
    });
  },
};
