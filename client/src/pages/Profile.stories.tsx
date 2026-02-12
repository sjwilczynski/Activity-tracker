import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Profile } from "./Profile";

const meta: Meta<typeof Profile> = {
  title: "Pages/Profile",
  component: Profile,
};

export default meta;
type Story = StoryObj<typeof Profile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/user name/i);

    expect(canvas.getByText(/test user/i)).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  },
};
