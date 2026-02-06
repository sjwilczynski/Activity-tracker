import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { ActivityList } from "./ActivityList";

const meta: Meta<typeof ActivityList> = {
  title: "Pages/ActivityList",
  component: ActivityList,
};

export default meta;
type Story = StoryObj<typeof ActivityList>;

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");

    await step("Verify date filter is visible", async () => {
      expect(
        canvas.getByRole("group", { name: /start date/i })
      ).toBeInTheDocument();
      expect(
        canvas.getByRole("group", { name: /end date/i })
      ).toBeInTheDocument();
    });

    await step("Verify table has correct columns", async () => {
      expect(canvas.getByText("Date")).toBeInTheDocument();
      expect(canvas.getByText("Activity name")).toBeInTheDocument();
      expect(canvas.getByText("Actions")).toBeInTheDocument();
    });
  },
};

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
    expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/an error has occurred/i);
    expect(
      canvas.getByRole("button", { name: /back to homepage/i })
    ).toBeInTheDocument();
  },
};

export const EmptyState: Story = {
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
    expect(canvas.getByText(/Quick add/i)).toBeInTheDocument();
  },
};

export const PaginationInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");
    expect(canvas.getByText(/1–10 of/i)).toBeInTheDocument();

    await step("Navigate to next page and back", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /go to next page/i })
      );
      await canvas.findByText(/11–20 of/i);

      await userEvent.click(
        canvas.getByRole("button", { name: /go to previous page/i })
      );
      await canvas.findByText(/1–10 of/i);
    });
  },
};

export const EditRowInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");

    await step("Enter and exit edit mode", async () => {
      const editButtons = canvas.getAllByRole("button", { name: /edit/i });
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(
          canvas.getByRole("button", { name: /save/i })
        ).toBeInTheDocument();
        expect(
          canvas.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
      });

      await userEvent.click(canvas.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(
          canvas.queryByRole("button", { name: /save/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const DeleteRowInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await screen.findByRole("table");
    screen.getByText("1–10 of 30");

    const deleteButtons = canvas.getAllByRole("button", { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    await screen.findByText("1–10 of 29");
  },
};

export const DateFilterInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");

    await step("Verify date filter is visible", async () => {
      expect(
        canvas.getByRole("group", { name: /start date/i })
      ).toBeInTheDocument();
      expect(
        canvas.getByRole("group", { name: /end date/i })
      ).toBeInTheDocument();
    });

    await step("Verify initial data is loaded", async () => {
      expect(canvas.getByText(/1–10 of/i)).toBeInTheDocument();
    });

    await step(
      "Apply current month filter and verify data exists",
      async () => {
        await userEvent.click(
          canvas.getByRole("button", { name: /show current month/i })
        );

        // Wait for the filtered data to load and verify it's not empty
        // The mocked date (2024-02-10) should show February activities
        await waitFor(() => {
          const paginationText = canvas.getByText(/\d+–\d+ of \d+/i);
          expect(paginationText).toBeInTheDocument();
          // Verify the count is greater than 0 (not "0 of 0")
          expect(paginationText.textContent).not.toMatch(/0–0 of 0/i);
        });

        expect(canvas.getByRole("table")).toBeInTheDocument();
      }
    );
  },
};

export const DateFilterInvalidRange: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");

    await step("Set end date before start date", async () => {
      const startDate = within(
        canvas.getByRole("group", { name: /start date/i })
      );
      const endDate = within(canvas.getByRole("group", { name: /end date/i }));

      // Fill start date: 2024-12-31
      await userEvent.click(
        startDate.getByRole("spinbutton", { name: /year/i })
      );
      await userEvent.keyboard("2024");
      await userEvent.click(
        startDate.getByRole("spinbutton", { name: /month/i })
      );
      await userEvent.keyboard("12");
      await userEvent.click(
        startDate.getByRole("spinbutton", { name: /day/i })
      );
      await userEvent.keyboard("31");

      // Fill end date: 2024-01-01
      await userEvent.click(endDate.getByRole("spinbutton", { name: /year/i }));
      await userEvent.keyboard("2024");
      await userEvent.click(
        endDate.getByRole("spinbutton", { name: /month/i })
      );
      await userEvent.keyboard("01");
      await userEvent.click(endDate.getByRole("spinbutton", { name: /day/i }));
      await userEvent.keyboard("01");
    });

    await step("Submit and verify error message", async () => {
      const filterButton = canvas.getByRole("button", {
        name: /set date range/i,
      });
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(
          canvas.getByText(/start date must be before/i)
        ).toBeInTheDocument();
      });
    });
  },
};
