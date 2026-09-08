import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { HydrateFallback } from "./HydrateFallback";

const meta = {
  title: "States/HydrateFallback",
  component: HydrateFallback,
} satisfies Meta<typeof HydrateFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
