import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
import { ActivityList } from "./ActivityList";

const meta: Meta<typeof ActivityList> = {
  title: "Pages/ActivityList",
  component: ActivityList,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActivityList>;

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

    await step("Verify table is rendered", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
    });

    await step("Verify date filter is visible", async () => {
      expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    await step("Verify table has correct columns", async () => {
      expect(canvas.getByText("Date")).toBeInTheDocument();
      expect(canvas.getByText("Activity name")).toBeInTheDocument();
      expect(canvas.getByText("Actions")).toBeInTheDocument();
    });
  },
};

// Loading state
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", async () => {
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

// Error state
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for error to display", async () => {
      await waitFor(
        () => {
          expect(
            canvas.getByText(/an error has occurred/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify back to homepage button exists", async () => {
      expect(
        canvas.getByRole("button", { name: /back to homepage/i })
      ).toBeInTheDocument();
    });
  },
};

// Empty state - no activities
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [http.get("*/api/activities", () => HttpResponse.json([]))],
    },
  },
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

    await step("Verify empty state message", async () => {
      expect(canvas.getByText(/no activities/i)).toBeInTheDocument();
    });
  },
};

// Pagination interaction
export const PaginationInteraction: Story = {
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

    await step("Verify pagination shows correct info", async () => {
      // Default is 10 rows per page, we have 30 activities
      expect(canvas.getByText(/1–10 of/i)).toBeInTheDocument();
    });

    await step("Navigate to next page", async () => {
      const nextPageButton = canvas.getByRole("button", {
        name: /go to next page/i,
      });
      await userEvent.click(nextPageButton);
    });

    await step("Verify second page is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText(/11–20 of/i)).toBeInTheDocument();
      });
    });

    await step("Navigate back to first page", async () => {
      const prevPageButton = canvas.getByRole("button", {
        name: /go to previous page/i,
      });
      await userEvent.click(prevPageButton);
    });

    await step("Verify first page is displayed again", async () => {
      await waitFor(() => {
        expect(canvas.getByText(/1–10 of/i)).toBeInTheDocument();
      });
    });
  },
};

// Edit row interaction
export const EditRowInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for table to load", async () => {
      await waitFor(
        () => {
          expect(canvas.getByRole("table")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Click edit on first row", async () => {
      const editButtons = canvas.getAllByRole("button", { name: /edit/i });
      await userEvent.click(editButtons[0]);
    });

    await step("Verify edit mode is active", async () => {
      await waitFor(() => {
        expect(
          canvas.getByRole("button", { name: /save/i })
        ).toBeInTheDocument();
        expect(
          canvas.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
      });
    });

    await step("Cancel editing", async () => {
      const cancelButton = canvas.getByRole("button", { name: /cancel/i });
      await userEvent.click(cancelButton);
    });

    await step("Verify back to read mode", async () => {
      await waitFor(() => {
        expect(
          canvas.queryByRole("button", { name: /save/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};

// Delete row interaction
export const DeleteRowInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for table to load", async () => {
      await waitFor(
        () => {
          expect(canvas.getByRole("table")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Click delete on first row", async () => {
      const deleteButtons = canvas.getAllByRole("button", { name: /delete/i });
      await userEvent.click(deleteButtons[0]);
    });

    await step("Verify deletion feedback", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/successfully deleted/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  },
};

// Date filter interaction
export const DateFilterInteraction: Story = {
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

    await step("Verify date filter form is present", async () => {
      expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    await step("Click submit button to apply filter", async () => {
      const submitButton = canvas.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);
    });

    await step("Verify table still renders after filter", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
    });
  },
};
