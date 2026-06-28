import type { Meta, StoryObj } from "@storybook/react-vite";
import { addDays, startOfWeek, subWeeks } from "date-fns";
import { expect, within } from "storybook/test";
import { HeatmapLegend } from "./HeatmapLegend";
import { WeeklyHeatmap } from "./WeeklyHeatmap";
import {
  buildWeeklyHeatmap,
  type HeatmapActivity,
} from "./weekly-heatmap-data";

/** Deterministic PRNG so the rendered heatmap (and screenshots) stay stable. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const END_DATE = new Date(2024, 5, 15, 12); // Sat Jun 15 2024
const LATEST_MONDAY = startOfWeek(END_DATE, { weekStartsOn: 1 }); // Mon Jun 10 2024

function activitiesInWeek(offsetFromLatest: number, count: number) {
  const weekStart = subWeeks(LATEST_MONDAY, offsetFromLatest);
  const midWeek = addDays(weekStart, 2); // keep it comfortably inside the week
  return Array.from(
    { length: count },
    (): HeatmapActivity => ({ date: new Date(midWeek), active: true })
  );
}

function seededActivities(): HeatmapActivity[] {
  const random = mulberry32(42);
  const activities: HeatmapActivity[] = [
    ...activitiesInWeek(0, 6), // latest week: 6 -> level 3 (asserted)
    ...activitiesInWeek(1, 2), // -> level 1
    ...activitiesInWeek(5, 9), // a clearly "max" week -> level 4
  ];
  for (let offset = 8; offset < 52; offset++) {
    const count = Math.floor(random() * 5); // 0–4
    activities.push(...activitiesInWeek(offset, count));
  }
  // An inactive activity in the latest week must NOT change the count.
  activities.push({ date: new Date(addDays(LATEST_MONDAY, 2)), active: false });
  return activities;
}

const buckets = buildWeeklyHeatmap(seededActivities(), {
  endDate: END_DATE,
  weeks: 52,
});

function HeatmapPreview() {
  return (
    <div className="max-w-2xl rounded-lg border bg-card p-4">
      <WeeklyHeatmap buckets={buckets} />
      <div className="mt-3 flex justify-end">
        <HeatmapLegend />
      </div>
    </div>
  );
}

const meta: Meta<typeof HeatmapPreview> = {
  title: "Visualization/WeeklyHeatmap",
  component: HeatmapPreview,
};

export default meta;
type Story = StoryObj<typeof HeatmapPreview>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Exactly 52 week cells render (one focusable button per week).
    const cells = canvas.getAllByRole("button");
    expect(cells).toHaveLength(52);

    // The known busy week has the expected level and accessible label.
    const busyWeek = canvas.getByRole("button", {
      name: "Week of Jun 10, 2024: 6 activities",
    });
    expect(busyWeek).toHaveAttribute("data-level", "3");

    // Empty weeks (level 0) render HOLLOW — transparent fill — so they stay
    // clearly distinct from level 1; active weeks are filled.
    const emptyCells = cells.filter(
      (cell) => cell.getAttribute("data-level") === "0"
    );
    expect(emptyCells.length).toBeGreaterThan(0);
    for (const cell of emptyCells) {
      expect((cell as HTMLElement).style.backgroundColor).toBe("transparent");
    }
    expect((busyWeek as HTMLElement).style.backgroundColor).not.toBe(
      "transparent"
    );

    // The legend is present.
    expect(canvas.getByText("Less")).toBeInTheDocument();
    expect(canvas.getByText("More")).toBeInTheDocument();

    // The group is described by the screen-reader summary (aria-describedby).
    const group = canvas.getByRole("group", {
      name: "Weekly activity heatmap, last 52 weeks",
    });
    const summaryId = group.getAttribute("aria-describedby");
    expect(summaryId).toBeTruthy();
    const summary = canvasElement.ownerDocument.getElementById(summaryId!);
    expect(summary).toHaveTextContent(
      /Weekly activity heatmap of the last 52 weeks/
    );
  },
};
