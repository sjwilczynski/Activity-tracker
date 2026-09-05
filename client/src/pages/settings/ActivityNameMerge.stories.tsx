import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { ActivityRecordWithIdServer } from "../../data";
import { handlers } from "../../mocks/handlers";
import { Settings } from "../Settings";

const meta: Meta<typeof Settings> = {
  title: "Pages/Activity name merge",
  component: Settings,
};
export default meta;
type Story = StoryObj<typeof meta>;
const headers = { "x-auth-token": "mock-token-12345" };
const readEntries = async (): Promise<ActivityRecordWithIdServer[]> =>
  (await fetch("/api/activities", { headers })).json();

async function startMerge(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await canvas.findAllByText("Sports");
  await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));
  const row = canvas
    .getAllByRole("row")
    .find(
      (item) =>
        within(item).queryByText("Running") && item.offsetParent !== null
    );
  if (!row) throw new Error("Missing Running row");
  await userEvent.click(within(row).getByRole("button", { name: /edit/i }));
  const dialog = within(await screen.findByRole("dialog"));
  const input = dialog.getByLabelText(/new activity name/i);
  await userEvent.clear(input);
  await userEvent.type(input, "Yoga");
  await userEvent.click(dialog.getByRole("button", { name: /update name/i }));
  expect(
    await dialog.findByText(/merge activity history/i)
  ).toBeInTheDocument();
  expect(dialog.getByText(/Wellness/)).toBeInTheDocument();
  expect(dialog.getByText(/8 entries/)).toBeInTheDocument();
  return dialog;
}

export const ConfirmedMigration: Story = {
  play: async ({ canvasElement }) => {
    const before = await readEntries();
    const dialog = await startMerge(canvasElement);
    expect(await readEntries()).toEqual(before);
    await userEvent.click(
      dialog.getByRole("button", { name: /confirm merge/i })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    const after = await readEntries();
    expect(after).toHaveLength(before.length);
    for (const entry of before) {
      expect(after.find((saved) => saved.id === entry.id)).toEqual(
        entry.name === "Running"
          ? { ...entry, name: "Yoga", categoryId: "cat-wellness", active: true }
          : entry
      );
    }
    expect(within(canvasElement).queryAllByText("Running")).toHaveLength(0);
  },
};

export const CancelMigration: Story = {
  play: async ({ canvasElement }) => {
    const before = await readEntries();
    const dialog = await startMerge(canvasElement);
    await userEvent.click(dialog.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(await readEntries()).toEqual(before);
    expect(document.activeElement).toHaveAccessibleName("Edit");
  },
};

export const BackToRename: Story = {
  play: async ({ canvasElement }) => {
    const before = await readEntries();
    const dialog = await startMerge(canvasElement);
    await userEvent.click(dialog.getByRole("button", { name: /back/i }));
    expect(dialog.getByLabelText(/new activity name/i)).toHaveValue("Yoga");
    expect(dialog.queryByRole("button", { name: /confirm merge/i })).toBeNull();
    expect(await readEntries()).toEqual(before);
    await userEvent.click(dialog.getByRole("button", { name: /update name/i }));
    expect(
      dialog.getByRole("button", { name: /confirm merge/i })
    ).toBeEnabled();
    await userEvent.click(dialog.getByRole("button", { name: /cancel/i }));
  },
};

export const ChangedTarget: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          "*/api/activities/rename",
          () =>
            new HttpResponse(
              "Merge target changed. Review the activity names and confirm again.",
              { status: 409 }
            )
        ),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const before = await readEntries();
    const dialog = await startMerge(canvasElement);
    await userEvent.click(
      dialog.getByRole("button", { name: /confirm merge/i })
    );
    expect(await dialog.findByRole("alert")).toHaveTextContent(
      /target changed/i
    );
    expect(await readEntries()).toEqual(before);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  },
};
