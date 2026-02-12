import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { expect, screen, userEvent, within } from "storybook/test";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";

const meta = {
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
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile2",
    },
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <MobileHeader />
          <div className="p-4">
            Page content <Story />
          </div>
        </SidebarInset>
      </SidebarProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Dashboard")).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: "Toggle Sidebar" })
    ).toBeInTheDocument();
  },
};

export const MobileDrawerOpen: Story = {
  ...Mobile,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggleButton = canvas.getByRole("button", {
      name: "Toggle Sidebar",
    });
    await userEvent.click(toggleButton);

    const sidebar = await screen.findByText("Activity Tracker");
    expect(sidebar).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("Activity List")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  },
};
