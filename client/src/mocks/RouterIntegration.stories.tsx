import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useNavigate } from "@tanstack/react-router";
import { useArgs } from "storybook/preview-api";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../components/ui/button";

function NavigationProbe({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div>
      <p>{label}</p>
      <Button onClick={() => void navigate({ to: "/charts" })}>
        Open analytics
      </Button>
    </div>
  );
}

const meta = {
  title: "Testing/Native Router integration",
  component: NavigationProbe,
  args: { label: "Initial story label" },
  parameters: { tanstack: { router: { path: "/welcome" } } },
} satisfies Meta<typeof NavigationProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RealNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Open analytics" })
    );
    await expect(await canvas.findByText("Activity Analytics")).toBeVisible();
    await expect(
      canvas.queryByText("Initial story label")
    ).not.toBeInTheDocument();
  },
};

export const LiveStoryArgs: Story = {
  // Live arg updates require Storybook's preview channel, not the Vitest story runner.
  tags: ["!test"],
  render: function LiveArgs(args) {
    const [, updateArgs] = useArgs<{ label: string }>();
    return (
      <>
        <NavigationProbe {...args} />
        <Button onClick={() => updateArgs({ label: "Updated story label" })}>
          Change label
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Change label" }));
    await expect(await canvas.findByText("Updated story label")).toBeVisible();
  },
};
