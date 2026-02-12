import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
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
      canvas.getByRole("button", { name: /log activity/i })
    ).toBeInTheDocument();
    // Stat cards are shown
    expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    expect(canvas.getByText("Last 7 Days")).toBeInTheDocument();
    expect(canvas.getByText("Last 30 Days")).toBeInTheDocument();
    expect(canvas.getByText("Last Activity")).toBeInTheDocument();
    // Recent activities section
    expect(canvas.getByText("Recent Activities")).toBeInTheDocument();
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

    expect(canvas.getByText(/no activities logged yet/i)).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /log activity/i })
    ).toBeInTheDocument();
    // Stat cards show 0 values and "None" for last activity
    await waitFor(() => {
      const zeros = canvas.getAllByText("0");
      expect(zeros.length).toBeGreaterThanOrEqual(1);
    });
    expect(canvas.getByText("None")).toBeInTheDocument();
  },
};

export const SubmitNewActivity: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill and submit activity form", async () => {
      // Click the combobox trigger to open the dropdown
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await userEvent.click(combobox);

      // Type in the search input inside the popover
      const searchInput =
        await screen.findByPlaceholderText(/search activities/i);
      await userEvent.type(searchInput, "Running");

      // Select the option from the dropdown
      const option = await screen.findByRole("option", { name: /running/i });
      await userEvent.click(option);

      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(() => {
        expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/activity added successfully/i)
      ).toBeInTheDocument();
    });
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

    // Activity name appears in both stat card and recent activities list
    const yogaMatches = canvas.getAllByText(/morning yoga/i);
    expect(yogaMatches.length).toBeGreaterThanOrEqual(1);
    const dateMatches = canvas.getAllByText(/jun 15, 2024/i);
    expect(dateMatches.length).toBeGreaterThanOrEqual(1);
  },
};

export const SubmitServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/api/activities", async () => {
          await delay(100);
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill and submit activity form", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await userEvent.click(combobox);

      const searchInput =
        await screen.findByPlaceholderText(/search activities/i);
      await userEvent.type(searchInput, "Running");

      const option = await screen.findByRole("option", { name: /running/i });
      await userEvent.click(option);

      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(() => {
        expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await step("Verify error toast appears", async () => {
      await waitFor(() => {
        expect(screen.getByText(/failed to add activity/i)).toBeInTheDocument();
      });
    });
  },
};

export const FormResetAfterSubmit: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill the form with activity data", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await userEvent.click(combobox);

      const searchInput =
        await screen.findByPlaceholderText(/search activities/i);
      await userEvent.type(searchInput, "Running");

      const option = await screen.findByRole("option", { name: /running/i });
      await userEvent.click(option);
    });

    await step("Verify form is filled", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      expect(combobox).toHaveTextContent("Running");
    });

    await step("Submit the form", async () => {
      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(() => {
        expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await step("Verify success message appears", async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/activity added successfully/i)
        ).toBeInTheDocument();
      });
    });

    await step("Verify form is reset after successful submission", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await waitFor(() => {
        expect(combobox).toHaveTextContent("Search activities...");
      });
    });
  },
};
