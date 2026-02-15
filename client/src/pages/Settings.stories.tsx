import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Settings } from "./Settings";

const meta: Meta<typeof Settings> = {
  title: "Pages/Settings",
  component: Settings,
};

export default meta;
type Story = StoryObj<typeof Settings>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Heading
    expect(await canvas.findByText("Settings")).toBeInTheDocument();
    expect(
      canvas.getByText("Manage your categories and activity types")
    ).toBeInTheDocument();

    // Tabs
    expect(
      canvas.getByRole("tab", { name: /categories/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("tab", { name: /activity names/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("tab", { name: /appearance/i })
    ).toBeInTheDocument();

    // Categories tab content loads asynchronously
    // Both mobile cards and desktop table are in DOM (CSS toggles visibility)
    const sportsElements = await canvas.findAllByText("Sports");
    expect(sportsElements.length).toBeGreaterThanOrEqual(1);
    expect(canvas.getAllByText("Wellness").length).toBeGreaterThanOrEqual(1);
    expect(canvas.getAllByText("Learning").length).toBeGreaterThanOrEqual(1);

    // Type badges (duplicated across mobile/desktop views)
    const activeBadges = canvas.getAllByText("active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(2);
    expect(canvas.getAllByText("inactive").length).toBeGreaterThanOrEqual(1);

    // Add category button
    expect(canvas.getByText("Add Category")).toBeInTheDocument();
  },
};

export const ActivityNamesTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for data to load first
    await canvas.findAllByText("Sports");

    // Switch to Activity Names tab
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));

    // Activity Names tab content should appear
    expect(await canvas.findByText("Activity Name")).toBeInTheDocument();
    expect(canvas.getByText("Count")).toBeInTheDocument();
  },
};

export const AppearanceTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to load
    await canvas.findByText("Settings");

    // Switch to Appearance tab
    await userEvent.click(
      canvas.getByRole("tab", { name: /appearance/i })
    );

    // Appearance tab content should appear (tab trigger + card title both contain "Appearance")
    const appearanceTexts = await canvas.findAllByText("Appearance");
    expect(appearanceTexts).toHaveLength(2);
    expect(canvas.getByText("Group by category")).toBeInTheDocument();
    expect(canvas.getByText("Fun animations")).toBeInTheDocument();

    const switches = canvas.getAllByRole("switch");
    expect(switches).toHaveLength(2);
  },
};
