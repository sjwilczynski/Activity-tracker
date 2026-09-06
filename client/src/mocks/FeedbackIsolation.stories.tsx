import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "../components/ui/button";

const meta: Meta = {
  title: "Mocks/Feedback isolation",
  render: () => (
    <Button onClick={() => toast.success("Current story feedback")}>
      Show feedback
    </Button>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LeavesFeedback: Story = {
  play: async () => {
    toast.success("Previous story feedback", { duration: Infinity });
    await expect(
      await screen.findByText("Previous story feedback")
    ).toBeInTheDocument();
  },
};

export const StartsClean: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(toast.getToasts()).toEqual([]);
    await expect(
      screen.queryByText("Previous story feedback")
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Show feedback" })
    );
    await expect(
      await screen.findByText("Current story feedback")
    ).toBeInTheDocument();
  },
};
