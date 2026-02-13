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
    expect(canvas.getByRole("tab", { name: /charts/i })).toBeInTheDocument();

    // Categories tab content loads asynchronously
    expect(await canvas.findByText("Sports")).toBeInTheDocument();
    expect(canvas.getByText("Wellness")).toBeInTheDocument();
    expect(canvas.getByText("Learning")).toBeInTheDocument();

    // Type badges
    const activeBadges = canvas.getAllByText("active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(2);
    expect(canvas.getByText("inactive")).toBeInTheDocument();

    // Add category button
    expect(canvas.getByText("Add Category")).toBeInTheDocument();
  },
};

export const ActivityNamesTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for data to load first
    await canvas.findByText("Sports");

    // Switch to Activity Names tab
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));

    // Activity Names tab content should appear
    expect(await canvas.findByText("Activity Name")).toBeInTheDocument();
    expect(canvas.getByText("Count")).toBeInTheDocument();
  },
};

export const ChartsTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to load
    await canvas.findByText("Settings");

    // Switch to Charts tab
    await userEvent.click(canvas.getByRole("tab", { name: /charts/i }));

    // Charts tab content should appear
    expect(await canvas.findByText("Chart Settings")).toBeInTheDocument();
    expect(canvas.getByText("Group by category")).toBeInTheDocument();
    expect(canvas.getByRole("switch")).toBeInTheDocument();
  },
};
