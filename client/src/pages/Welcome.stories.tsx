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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /log activity/i })
    ).toBeInTheDocument();
    // Stat cards are shown
    await expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    await expect(canvas.getByText("Last 7 Days")).toBeInTheDocument();
    await expect(canvas.getByText("Last 30 Days")).toBeInTheDocument();
    await expect(canvas.getByText("Last Activity")).toBeInTheDocument();
    // Recent activities section
    await expect(canvas.getByText("Recent Activities")).toBeInTheDocument();
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
    await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByText(/no activities logged yet/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /log activity/i })
    ).toBeInTheDocument();
    // Stat cards show 0 values and "None" for last activity
    await waitFor(async () => {
      const zeros = canvas.getAllByText("0");
      await expect(zeros.length).toBeGreaterThanOrEqual(1);
    });
    await expect(canvas.getByText("None")).toBeInTheDocument();
  },
};

export const SubmitNewActivity: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill and submit activity form", async () => {
      await selectActivity(canvas, "Running");

      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(async () => {
        await expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await waitFor(async () => {
      await expect(
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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Activity name appears in both stat card and recent activities list
    const yogaMatches = canvas.getAllByText(/morning yoga/i);
    await expect(yogaMatches.length).toBeGreaterThanOrEqual(1);
    const dateMatches = canvas.getAllByText(/jun 15, 2024/i);
    await expect(dateMatches.length).toBeGreaterThanOrEqual(1);
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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill and submit activity form", async () => {
      await selectActivity(canvas, "Running");

      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(async () => {
        await expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await step("Verify error toast appears", async () => {
      await waitFor(async () => {
        await expect(
          screen.getByText(/failed to add activity/i)
        ).toBeInTheDocument();
      });
    });
  },
};

export const AddWithDetailsInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Open the Add with Details dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /add with details/i })
      );
      await waitFor(async () => {
        await expect(
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

      await waitFor(async () => {
        await expect(
          screen.getByText(/activity logged successfully/i)
        ).toBeInTheDocument();
      });

      await waitFor(async () => {
        await expect(
          screen.queryByRole("heading", { name: /log activity with details/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const RecentActivitiesShowDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    // Running activity has intensity: "high" which maps to "Intense"
    // IntensityBadge renders two spans (light + dark mode), so use getAllByText
    const intenseBadges = canvas.getAllByText("Intense");
    await expect(intenseBadges.length).toBeGreaterThanOrEqual(1);

    // Running's timeSpent is 45
    await expect(canvas.getByText("• 45 min")).toBeInTheDocument();

    // Running's description
    await expect(
      canvas.getByText(/morning run in the park/i)
    ).toBeInTheDocument();
  },
};

export const FormResetAfterSubmit: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Fill the form with activity data", async () => {
      await selectActivity(canvas, "Running");
    });

    await step("Verify form is filled", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await expect(combobox).toHaveTextContent("Running");
    });

    await step("Submit the form", async () => {
      const submitBtn = canvas.getByRole("button", { name: /log activity/i });
      await waitFor(async () => {
        await expect(submitBtn).toBeEnabled();
      });
      await userEvent.click(submitBtn);
    });

    await step("Verify success message appears", async () => {
      await waitFor(async () => {
        await expect(
          screen.getByText(/activity added successfully/i)
        ).toBeInTheDocument();
      });
    });

    await step("Verify form is reset after successful submission", async () => {
      const combobox = canvas.getByRole("combobox", {
        name: /activity name/i,
      });
      await waitFor(async () => {
        await expect(combobox).toHaveTextContent("Search activities...");
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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(canvas.getByText(/welcome/i)).toBeInTheDocument();
    await expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    await expect(canvas.getByText("Recent Activities")).toBeInTheDocument();
  },
};

export const FuzzySearch: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const combobox = canvas.getByRole("combobox", { name: /activity name/i });
    await userEvent.click(combobox);
    const searchInput =
      await screen.findByPlaceholderText(/search activities/i);

    await step(
      "Browsing (empty query) keeps the category headings for context",
      async () => {
        // The activities are grouped under their category headings while the
        // user is just browsing the full list.
        await expect(
          document.querySelectorAll("[cmdk-group-heading]").length
        ).toBeGreaterThan(0);
      }
    );

    await step(
      "Substitution typo surfaces the right activity (guards the edit-distance path)",
      async () => {
        // "Runninh" substitutes the trailing 'g' with 'h'. This is NOT an
        // in-order subsequence of "Running", so cmdk's default filter scores it
        // 0 and would hide it. Only fuzzyFilter's edit-distance fallback matches
        // it — so this assertion fails if that fallback regresses.
        await userEvent.type(searchInput, "Runninh");
        await waitFor(async () => {
          await expect(
            screen.getByRole("option", { name: /running/i })
          ).toBeInTheDocument();
        });
        await expect(
          screen.queryByRole("option", { name: /swimming/i })
        ).not.toBeInTheDocument();
        await expect(
          screen.queryByRole("option", { name: /cycling/i })
        ).not.toBeInTheDocument();
      }
    );

    await step("Transposition typo also matches", async () => {
      // "Ygoa" swaps two characters of "Yoga".
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, "Ygoa");
      await waitFor(async () => {
        await expect(
          screen.getByRole("option", { name: /yoga/i })
        ).toBeInTheDocument();
      });
      await expect(
        screen.queryByRole("option", { name: /running/i })
      ).not.toBeInTheDocument();
    });

    await step(
      "Searching flattens groups so the closest match ranks first globally",
      async () => {
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, "ding");
        await waitFor(async () => {
          await expect(
            screen.getByRole("option", { name: /reading/i })
          ).toBeInTheDocument();
        });

        // "ding" is a contiguous substring of "Reading" (Learning category) but
        // only a typo match for "Running"/"Swimming"/"Cycling" (Sports). The
        // exact substring match must rank first, ahead of the typo matches —
        // even though they live in a different, earlier category.
        const options = screen.getAllByRole("option");
        await expect(options[0]).toHaveTextContent(/reading/i);
        await expect(
          screen.getByRole("option", { name: /running/i })
        ).toBeInTheDocument();

        // While searching, options render as one flat list (no category
        // headings) so cmdk sorts every option against each other globally
        // instead of only within its own group.
        await expect(
          document.querySelectorAll("[cmdk-group-heading]").length
        ).toBe(0);
      }
    );

    await step("Select a typo-matched option", async () => {
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, "Runninh");
      await userEvent.click(
        await screen.findByRole("option", { name: /running/i })
      );
      await expect(combobox).toHaveTextContent("Running");
    });
  },
};
