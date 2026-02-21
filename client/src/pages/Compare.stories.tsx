import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Compare } from "./Compare";

const meta: Meta<typeof Compare> = {
  title: "Pages/Compare",
  component: Compare,
};

export default meta;
type Story = StoryObj<typeof Compare>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(
      canvas.getByRole("heading", { name: /compare periods/i })
    ).toBeInTheDocument();
    expect(canvas.getByText("No periods selected")).toBeInTheDocument();
  },
};

export const AddPeriodInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Select February month", async () => {
      const monthTrigger = canvas.getByRole("combobox", { name: /month/i });
      await userEvent.click(monthTrigger);
      const februaryOption = await screen.findByRole("option", {
        name: "February",
      });
      await userEvent.click(februaryOption);
    });

    await step("Select year 2024", async () => {
      const yearTrigger = canvas.getByRole("combobox", { name: /year/i });
      await userEvent.click(yearTrigger);
      const yearOption = await screen.findByRole("option", { name: "2024" });
      await userEvent.click(yearOption);
    });

    await step("Add the period", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /add period/i })
      );
    });

    await step("Verify period badge and charts appear", async () => {
      await waitFor(() => {
        // "February 2024" appears in both badge and metric card
        const matches = canvas.getAllByText("February 2024");
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });

      expect(canvas.getByText("Activity Comparison")).toBeInTheDocument();
      expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    });
  },
};
