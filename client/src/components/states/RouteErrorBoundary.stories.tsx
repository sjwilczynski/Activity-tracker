import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, fn, within } from "storybook/test";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

const meta = {
  title: "States/RouteErrorBoundary",
  component: RouteErrorBoundary,
  args: { error: new Error("Request failed"), reset: fn() },
} satisfies Meta<typeof RouteErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unauthorized: Story = {
  args: { error: Object.assign(new Error("Unauthorized"), { status: 401 }) },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { name: "Session Expired" })
    ).toBeVisible();
  },
};

export const Forbidden: Story = {
  args: { error: Object.assign(new Error("Forbidden"), { status: 403 }) },
};

export const NotFound: Story = {
  args: { error: Object.assign(new Error("Not found"), { status: 404 }) },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", { name: "Page Not Found" })
    ).toBeVisible();
  },
};

export const ServerError: Story = {
  args: { error: Object.assign(new Error("Server error"), { status: 500 }) },
};

export const GenericError: Story = {
  args: { error: new Error("Network unavailable") },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("heading", {
        name: "Something Went Wrong",
      })
    ).toBeVisible();
  },
};
