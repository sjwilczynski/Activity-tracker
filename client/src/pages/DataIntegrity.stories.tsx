import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import type { UserData } from "../../../shared/types";
import type { ActivityRecordWithIdServer } from "../data";
import { actionRouting } from "../mocks/actionRouting";
import { ActivityList } from "./ActivityList";

const meta: Meta<typeof ActivityList> = {
  title: "Pages/Data integrity",
  component: ActivityList,
  parameters: { reactRouter: actionRouting("activity-list") },
};
export default meta;
type Story = StoryObj<typeof meta>;
const headers = { "x-auth-token": "mock-token-12345" };

export const RestoreExport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("All Activities");
    const exported: UserData = await (
      await fetch("/api/export", { headers })
    ).json();
    await expect(exported.activities["1"]).not.toHaveProperty("categoryId");
    await expect(exported.activities["1"]).toMatchObject({
      name: "Running",
      timeSpent: 45,
      description: "Morning run in the park, felt great!",
    });

    await fetch("/api/activities/1", { method: "DELETE", headers });
    await userEvent.click(canvas.getByRole("button", { name: /upload/i }));
    const dialog = within(await screen.findByRole("dialog"));
    await userEvent.upload(
      dialog.getByLabelText(/select file/i, { selector: "input" }),
      new File([JSON.stringify(exported)], "backup.json", {
        type: "application/json",
      })
    );
    await userEvent.click(dialog.getByRole("button", { name: "Upload" }));
    await waitFor(() =>
      expect(
        screen.getByText("Successfully uploaded the file")
      ).toBeInTheDocument()
    );
    const restored = await (await fetch("/api/export", { headers })).json();
    await expect(restored).toEqual(exported);
    await expect(canvas.getByText(/of 30 activities/i)).toBeInTheDocument();
  },
};

export const ClearSavedDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("All Activities");
    const editButton = canvas
      .getAllByRole("button", { name: /edit/i })
      .find((button) => button.offsetParent !== null);
    if (!editButton) throw new Error("No visible edit button");
    await userEvent.click(editButton);
    const dialog = within(await screen.findByRole("dialog"));
    await expect(dialog.getByLabelText("Description")).toHaveValue(
      "Morning run in the park, felt great!"
    );
    await expect(dialog.getByLabelText("Time Spent")).toHaveValue(45);
    await userEvent.clear(dialog.getByLabelText("Description"));
    await userEvent.clear(dialog.getByLabelText("Time Spent"));
    await userEvent.click(dialog.getByRole("combobox", { name: "Intensity" }));
    await userEvent.click(await screen.findByRole("option", { name: "None" }));
    await userEvent.click(
      dialog.getByRole("button", { name: /save changes/i })
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );

    const entries: ActivityRecordWithIdServer[] = await (
      await fetch("/api/activities", { headers })
    ).json();
    const saved = entries.find((entry) => entry.id === "1");
    await expect(saved).not.toHaveProperty("description");
    await expect(saved).not.toHaveProperty("timeSpent");
    await expect(saved).not.toHaveProperty("intensity");
    await expect(saved).toMatchObject({ name: "Running", date: "2024-02-10" });
  },
};

export const RestoreLegacyArray: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("All Activities");
    const record = { name: "Running", date: "2024-02-10", timeSpent: 0 };
    const category = {
      name: "Sports",
      description: "",
      active: true,
      activityNames: ["Running"],
    };
    await userEvent.click(canvas.getByRole("button", { name: /upload/i }));
    const dialog = within(await screen.findByRole("dialog"));
    await userEvent.upload(
      dialog.getByLabelText(/select file/i, { selector: "input" }),
      new File(
        [
          JSON.stringify({
            activities: [null, record],
            categories: [null, category],
          }),
        ],
        "old-backup.json",
        { type: "application/json" }
      )
    );
    await userEvent.click(dialog.getByRole("button", { name: "Upload" }));
    await waitFor(() =>
      expect(
        screen.getByText("Successfully uploaded the file")
      ).toBeInTheDocument()
    );
    const exported: UserData = await (
      await fetch("/api/export", { headers })
    ).json();
    await expect(exported.activities).toEqual({ "1": record });
    await expect(exported.categories).toEqual({ "1": category });
  },
};
