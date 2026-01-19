import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor, screen } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
import { Welcome } from "./Welcome";

const meta: Meta<typeof Welcome> = {
  title: "Pages/Welcome",
  component: Welcome,
};

export default meta;
type Story = StoryObj<typeof Welcome>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /add activity/i })
    ).toBeInTheDocument();
    expect(canvas.getByText(/last added/i)).toBeInTheDocument();
  },
};

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
    expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

export const NoActivities: Story = {
  parameters: {
    msw: {
      handlers: [http.get("*/api/activities", () => HttpResponse.json([]))],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.queryByText(/last added/i)).not.toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /add activity/i })
    ).toBeInTheDocument();
  },
};

export const SubmitNewActivity: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill and submit activity form", async () => {
      const input = canvas.getByLabelText(/activity name/i);
      await userEvent.click(input);
      await userEvent.type(input, "Running");

      const option = await screen.findByRole("option", { name: /running/i });
      await userEvent.click(option);

      const submitBtn = canvas.getByRole("button", { name: /add activity/i });
      await waitFor(() => {
        expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await canvas.findByText(/activity added successfully/i);
  },
};

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.getByText(/morning yoga/i)).toBeInTheDocument();
    expect(canvas.getByText(/2024-06-15/)).toBeInTheDocument();
  },
};
