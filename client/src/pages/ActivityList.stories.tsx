import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor, screen } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole("table");

    expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /show current month/i })
    );

    expect(canvas.getByRole("table")).toBeInTheDocument();
  },
};
