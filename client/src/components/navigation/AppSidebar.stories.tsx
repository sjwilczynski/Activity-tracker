import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { expect, within } from "storybook/test";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

const meta: Meta<typeof AppSidebar> = {
  title: "Navigation/AppSidebar",
  component: AppSidebar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: [{ path: "/welcome", useStoryElement: true }],
      location: { path: "/welcome" },
    }),
  },
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Activity Tracker")).toBeInTheDocument();
    expect(canvas.getByText("Track your progress")).toBeInTheDocument();

    expect(canvas.getByText("Dashboard")).toBeInTheDocument();
    expect(canvas.getByText("Charts")).toBeInTheDocument();
    expect(canvas.getByText("Activity List")).toBeInTheDocument();
    expect(canvas.getByText("Settings")).toBeInTheDocument();

    expect(canvas.getByText("Test User")).toBeInTheDocument();
    expect(canvas.getByText("Active user")).toBeInTheDocument();
    expect(canvas.getByText("Sign Out")).toBeInTheDocument();
    expect(canvas.getByLabelText("Toggle theme")).toBeInTheDocument();
  },
};
