import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor, screen } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
import { Welcome } from "./Welcome";

const meta: Meta<typeof Welcome> = {
  title: "Pages/Welcome",
  component: Welcome,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Welcome>;

// Default story - normal state with activities
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify welcome message is shown", async () => {
      expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
    });

    await step("Verify add activity form is visible", async () => {
      expect(
        canvas.getByRole("button", { name: /add activity/i })
      ).toBeInTheDocument();
    });

    await step("Verify last activity is shown", async () => {
      expect(canvas.getByText(/last added/i)).toBeInTheDocument();
    });
  },
};

// Loading state - API never resolves
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", async () => {
          await delay("infinite");
        }),
        http.get("*/api/categories", async () => {
          await delay("infinite");
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

// No activities state
export const NoActivities: Story = {
  parameters: {
    msw: {
      handlers: [http.get("*/api/activities", () => HttpResponse.json([]))],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify no last activity message", async () => {
      expect(canvas.queryByText(/last added/i)).not.toBeInTheDocument();
    });

    await step("Verify form is still available", async () => {
      expect(
        canvas.getByRole("button", { name: /add activity/i })
      ).toBeInTheDocument();
    });
  },
};

// Submit new activity interaction
export const SubmitNewActivity: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Fill activity autocomplete", async () => {
      const input = canvas.getByLabelText(/activity name/i);
      await userEvent.click(input);
      await userEvent.type(input, "Running");

      await waitFor(async () => {
        const option = screen.getByRole("option", { name: /running/i });
        await userEvent.click(option);
      });
    });

    await step("Submit form", async () => {
      const submitBtn = canvas.getByRole("button", { name: /add activity/i });
      await waitFor(() => {
        expect(submitBtn).not.toBeDisabled();
      });
      await userEvent.click(submitBtn);
    });

    await step("Verify success feedback", async () => {
      await waitFor(
        () => {
          expect(
            canvas.getByText(/activity added successfully/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  },
};

// With specific last activity data
export const WithLastActivity: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return HttpResponse.json([
            {
              id: "test-1",
              date: "2024-06-15",
              name: "Morning Yoga",
              active: true,
            },
          ]);
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for data to load", async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify last activity is displayed", async () => {
      expect(canvas.getByText(/morning yoga/i)).toBeInTheDocument();
      expect(canvas.getByText(/2024-06-15/)).toBeInTheDocument();
    });
  },
};
