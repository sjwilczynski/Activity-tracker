import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { http, HttpResponse, delay } from "msw";
import { Charts } from "./Charts";

const meta: Meta<typeof Charts> = {
  title: "Pages/Charts",
  component: Charts,
};

export default meta;
type Story = StoryObj<typeof Charts>;

const generateDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(3);
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
    expect(
      canvas.getByText(/haven't added any activities/i)
    ).toBeInTheDocument();
  },
};

export const DateFilterInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/end date/i)).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /show current month/i })
    );

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(3);
  },
};

export const SingleActivityType: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return HttpResponse.json([
            { id: "1", date: generateDate(0), name: "Running", active: true },
            { id: "2", date: generateDate(1), name: "Running", active: true },
            { id: "3", date: generateDate(2), name: "Running", active: true },
            { id: "4", date: generateDate(3), name: "Running", active: true },
            { id: "5", date: generateDate(4), name: "Running", active: true },
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

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(3);
  },
};

export const ManyActivityTypes: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          const activities = [
            "Running",
            "Swimming",
            "Cycling",
            "Yoga",
            "Meditation",
            "Reading",
            "Walking",
            "Hiking",
            "Dancing",
            "Gym",
            "Basketball",
            "Soccer",
          ].flatMap((name, idx) =>
            Array.from({ length: 3 }, (_, i) => ({
              id: `${idx * 3 + i + 1}`,
              date: generateDate(i),
              name,
              active: idx % 2 === 0,
            }))
          );
          return HttpResponse.json(activities);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(3);
  },
};
