import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, screen, userEvent, within } from "storybook/test";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";

const meta = {
  title: "Navigation/AppSidebar",
  component: AppSidebar,
  render: () => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <div className="p-4">Page content</div>
      </SidebarInset>
    </SidebarProvider>
  ),
  parameters: {
    tanstack: { router: { path: "/welcome" } },
  },
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Activity Tracker")).toBeInTheDocument();
    await expect(canvas.getByText("Track your progress")).toBeInTheDocument();

    await expect(canvas.getByText("Dashboard")).toBeInTheDocument();
    await expect(canvas.getByText("Charts")).toBeInTheDocument();
    await expect(canvas.getByText("Activity List")).toBeInTheDocument();
    await expect(canvas.getByText("Settings")).toBeInTheDocument();

    await expect(canvas.getByText("Test User")).toBeInTheDocument();
    await expect(canvas.getByText("Active user")).toBeInTheDocument();
    await expect(canvas.getByText("Sign Out")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Toggle theme")).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile2",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Dashboard")).toBeInTheDocument();
    await expect(
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

    const sidebar = await screen.findByRole("heading", {
      name: "Activity Tracker",
      level: 2,
    });
    await expect(sidebar).toBeInTheDocument();
    await expect(screen.getByText("Charts")).toBeInTheDocument();
    await expect(screen.getByText("Activity List")).toBeInTheDocument();
    await expect(screen.getByText("Settings")).toBeInTheDocument();
  },
};
