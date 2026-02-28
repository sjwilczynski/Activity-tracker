import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  darkPreferencesHandler,
  handlers as defaultHandlers,
} from "../mocks/handlers";
import { Welcome } from "./Welcome";

const meta: Meta<typeof Welcome> = {
  title: "Pages/Welcome",
  component: Welcome,
};

export default meta;
type Story = StoryObj<typeof Welcome>;

async function selectActivity(canvas: ReturnType<typeof within>, name: string) {
  const combobox = canvas.getByRole("combobox", { name: /activity name/i });
  await userEvent.click(combobox);
  const searchInput = await screen.findByPlaceholderText(/search activities/i);
  await userEvent.type(searchInput, name);
  const option = await screen.findByRole("option", {
    name: new RegExp(name, "i"),
  });
  await userEvent.click(option);
}

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
      handlers: [
        http.get("*/api/activities", () => HttpResponse.json([])),
        ...defaultHandlers,
      ],
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
      await selectActivity(canvas, "Running");

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
        ...defaultHandlers,
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
        // Override POST to return 500, keep default GET handlers for activities + categories
        http.post("*/api/activities", async () => {
          await delay(100);
          return new HttpResponse(null, { status: 500 });
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

    await step("Fill and submit activity form", async () => {
      await selectActivity(canvas, "Running");

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

export const AddWithDetailsInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Open the Add with Details dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /add with details/i })
      );
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /log activity with details/i })
        ).toBeInTheDocument();
      });
    });

    await step("Fill in the date", async () => {
      // There are two Date labels on the page (quick form + dialog).
      // The dialog one is the last one rendered in the portal.
      const dateInputs = screen.getAllByLabelText("Date");
      const dateInput = dateInputs[dateInputs.length - 1];
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, "2024-02-10");
    });

    await step("Select an activity", async () => {
      const combobox = screen.getByRole("combobox", {
        name: /activity name/i,
      });
      await userEvent.click(combobox);
      const searchInput =
        await screen.findByPlaceholderText(/search activities/i);
      await userEvent.type(searchInput, "Running");
      const option = await screen.findByRole("option", {
        name: /running/i,
      });
      await userEvent.click(option);
    });

    await step("Select intensity Low", async () => {
      const intensityTrigger = screen.getByRole("combobox", {
        name: /intensity/i,
      });
      await userEvent.click(intensityTrigger);
      const lowOption = await screen.findByRole("option", { name: /low/i });
      await userEvent.click(lowOption);
    });

    await step("Fill time spent and description", async () => {
      const timeInput = screen.getByLabelText("Time Spent");
      await userEvent.type(timeInput, "30");

      const descriptionInput = screen.getByLabelText("Description");
      await userEvent.type(descriptionInput, "Test description");
    });

    await step("Submit and verify success", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /log activity/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/activity logged successfully/i)
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: /log activity with details/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const RecentActivitiesShowDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Running activity has intensity: "high" which maps to "Intense"
    // IntensityBadge renders two spans (light + dark mode), so use getAllByText
    const intenseBadges = canvas.getAllByText("Intense");
    expect(intenseBadges.length).toBeGreaterThanOrEqual(1);

    // Running's timeSpent is 45
    expect(canvas.getByText("• 45 min")).toBeInTheDocument();

    // Running's description
    expect(canvas.getByText(/morning run in the park/i)).toBeInTheDocument();
  },
};

export const FormResetAfterSubmit: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill the form with activity data", async () => {
      await selectActivity(canvas, "Running");
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

export const DarkMode: Story = {
  parameters: {
    msw: {
      handlers: [darkPreferencesHandler, ...defaultHandlers],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
    expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    expect(canvas.getByText("Recent Activities")).toBeInTheDocument();
  },
};
