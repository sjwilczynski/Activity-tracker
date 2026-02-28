import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  darkPreferencesHandler,
  handlers as defaultHandlers,
} from "../mocks/handlers";
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

    expect(
      canvas.getByRole("button", { name: /all time/i })
    ).toBeInTheDocument();

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(2);

    expect(canvas.getByText("Total Activities")).toBeInTheDocument();
    expect(canvas.getByText("Unique Activities")).toBeInTheDocument();
    expect(canvas.getByText("Most Popular")).toBeInTheDocument();
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await step("Verify date range picker is visible", async () => {
      expect(
        canvas.getByRole("button", { name: /all time/i })
      ).toBeInTheDocument();
    });

    await step("Verify initial charts are rendered with data", async () => {
      const chartElements = canvasElement.querySelectorAll("canvas");
      expect(chartElements.length).toBe(2);
      expect(
        canvas.queryByText(/haven't added any activities/i)
      ).not.toBeInTheDocument();
    });

    await step(
      "Open picker, apply Last Month preset, verify charts still render",
      async () => {
        await userEvent.click(
          canvas.getByRole("button", { name: /all time/i })
        );

        await waitFor(() => {
          expect(screen.getByText("Select Date Range")).toBeInTheDocument();
        });

        await userEvent.click(
          screen.getByRole("button", { name: /last month/i })
        );

        await waitFor(() => {
          expect(
            screen.queryByText("Select Date Range")
          ).not.toBeInTheDocument();
        });

        await waitFor(() => {
          const chartElements = canvasElement.querySelectorAll("canvas");
          expect(chartElements.length).toBe(2);
        });

        expect(
          canvas.queryByText(/haven't added any activities/i)
        ).not.toBeInTheDocument();
      }
    );
  },
};

export const SingleActivityType: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          return HttpResponse.json([
            {
              id: "1",
              date: generateDate(0),
              name: "Running",
              categoryId: "cat-sports",
              active: true,
            },
            {
              id: "2",
              date: generateDate(1),
              name: "Running",
              categoryId: "cat-sports",
              active: true,
            },
            {
              id: "3",
              date: generateDate(2),
              name: "Running",
              categoryId: "cat-sports",
              active: true,
            },
            {
              id: "4",
              date: generateDate(3),
              name: "Running",
              categoryId: "cat-sports",
              active: true,
            },
            {
              id: "5",
              date: generateDate(4),
              name: "Running",
              categoryId: "cat-sports",
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

    const chartElements = canvasElement.querySelectorAll("canvas");
    expect(chartElements.length).toBe(2);

    expect(canvas.getByText("5")).toBeInTheDocument();
    expect(canvas.getByText("1")).toBeInTheDocument();
    expect(canvas.getByText("Running")).toBeInTheDocument();
  },
};

export const ManyActivityTypes: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/activities", () => {
          const categoryMap: Record<string, string> = {
            Running: "cat-sports",
            Swimming: "cat-sports",
            Cycling: "cat-sports",
            Yoga: "cat-wellness",
            Meditation: "cat-wellness",
            Reading: "cat-learning",
            Walking: "cat-outdoor",
            Hiking: "cat-outdoor",
            Dancing: "cat-other",
            Gym: "cat-gym",
            Basketball: "cat-team",
            Soccer: "cat-team",
          };
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
              categoryId: categoryMap[name],
              active: true,
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
    expect(chartElements.length).toBe(2);

    expect(canvas.getByText("36")).toBeInTheDocument();
    expect(canvas.getByText("12")).toBeInTheDocument();
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

    expect(
      canvas.getByRole("button", { name: /all time/i })
    ).toBeInTheDocument();
    expect(canvas.getByText("Total Activities")).toBeInTheDocument();
  },
};
