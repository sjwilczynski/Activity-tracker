import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { handlers as defaultHandlers } from "../mocks/handlers";
import { Welcome } from "./Welcome";

const meta: Meta<typeof Welcome> = {
  title: "Pages/Welcome/Onboarding",
  component: Welcome,
  parameters: {
    msw: {
      handlers: [
        // Return empty categories to trigger onboarding
        http.get("*/api/categories", () => HttpResponse.json([])),
        // Return empty activities
        http.get("*/api/activities", () => HttpResponse.json([])),
        // Handle import for onboarding submission
        http.post("*/api/import", () => {
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Welcome>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Onboarding card is shown
    expect(
      canvas.getByText(/welcome! set up your activities/i)
    ).toBeInTheDocument();
    expect(canvas.getByText(/pick the categories/i)).toBeInTheDocument();

    // Default categories are visible
    expect(canvas.getByText("Running")).toBeInTheDocument();
    expect(canvas.getByText("Cycling")).toBeInTheDocument();
    expect(canvas.getByText("Swimming")).toBeInTheDocument();
    expect(canvas.getByText("Wellness")).toBeInTheDocument();

    // Buttons present
    expect(
      canvas.getByRole("button", { name: /get started/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /skip for now/i })
    ).toBeInTheDocument();

    // Selected count shown (9 active categories by default)
    expect(canvas.getByText(/9 categories selected/i)).toBeInTheDocument();
  },
};

export const ToggleCategoryAndActivities: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Uncheck Running category", async () => {
      const runningCheckbox = canvas.getByRole("checkbox", {
        name: /running/i,
      });
      await userEvent.click(runningCheckbox);
      // Count decreases
      expect(canvas.getByText(/8 categories selected/i)).toBeInTheDocument();
    });

    await step("Expand Cycling to see activity names", async () => {
      const cyclingTrigger = canvas.getByText("Cycling").closest("button")!;
      await userEvent.click(cyclingTrigger);

      // Activity names should be visible
      await waitFor(() => {
        expect(canvas.getByText("Indoor Cycling")).toBeInTheDocument();
      });
      expect(canvas.getByText("Spinning")).toBeInTheDocument();
    });

    await step("Uncheck an individual activity", async () => {
      const spinningCheckbox = canvas.getByRole("checkbox", {
        name: /spinning/i,
      });
      await userEvent.click(spinningCheckbox);
      // Spinning is unchecked but Cycling category still selected
      expect(canvas.getByText(/8 categories selected/i)).toBeInTheDocument();
    });

    await step("Re-check Running", async () => {
      const runningCheckbox = canvas.getByRole("checkbox", {
        name: /running/i,
      });
      await userEvent.click(runningCheckbox);
      expect(canvas.getByText(/9 categories selected/i)).toBeInTheDocument();
    });
  },
};

export const SkipOnboarding: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Click skip button", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /skip for now/i })
      );
    });

    await step("Onboarding card is hidden, dashboard shown", async () => {
      await waitFor(() => {
        expect(
          canvas.queryByText(/welcome! set up your activities/i)
        ).not.toBeInTheDocument();
      });
      // Normal dashboard content shown
      expect(canvas.getByText("Total Activities")).toBeInTheDocument();
      expect(canvas.getByText("Recent Activities")).toBeInTheDocument();
    });
  },
};

export const SubmitCategories: Story = {
  parameters: {
    msw: {
      handlers: [
        // Empty categories initially
        http.get("*/api/categories", () => HttpResponse.json([])),
        http.get("*/api/activities", () => HttpResponse.json([])),
        // Import succeeds
        http.post("*/api/import", () => {
          return new HttpResponse(null, { status: 200 });
        }),
        ...defaultHandlers,
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Click Get Started", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /get started/i })
      );
    });

    await step("Verify loading state appears and resolves", async () => {
      await waitFor(() => {
        expect(
          canvas.getByRole("button", { name: /setting up/i })
        ).toBeInTheDocument();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(
          canvas.queryByRole("button", { name: /setting up/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};
