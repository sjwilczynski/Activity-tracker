import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { http, HttpResponse } from "msw";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { FileUploadForm } from "./FileUploadForm";

const submitImport = fn();
const importData = {
  activities: {
    running: { date: "2024-03-10", name: "Running", categoryId: "sports" },
  },
  categories: {
    sports: {
      name: "Sports",
      active: true,
      description: "",
      activityNames: ["Running"],
    },
  },
};

const meta: Meta<typeof FileUploadForm> = {
  title: "Forms/File upload",
  component: FileUploadForm,
  beforeEach: () => {
    submitImport.mockClear();
  },
  parameters: {
    msw: {
      handlers: [
        http.post("/api/import", async ({ request }) => {
          submitImport(await request.json());
          return HttpResponse.json({ ok: true });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileUploadForm>;

export const ResetAndReselectAfterSuccess: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const upload = canvas.getByRole("button", { name: "Upload" });
    const file = new File([JSON.stringify(importData)], "activities.json", {
      type: "application/json",
    });

    await expect(upload).toBeDisabled();
    await step(
      "Select a valid file and submit through the real mutation",
      async () => {
        await userEvent.upload(canvas.getByLabelText("Select file"), file);
        await expect(canvas.getByText("activities.json")).toBeInTheDocument();
        await expect(upload).toBeEnabled();
        await userEvent.click(upload);
        await screen.findByText("Successfully uploaded the file");
        await expect(submitImport).toHaveBeenCalledWith(importData);
      }
    );

    await step(
      "Success resets the form-level null default and dirty state",
      async () => {
        await waitFor(async () => {
          await expect(
            canvas.queryByText("activities.json")
          ).not.toBeInTheDocument();
          await expect(upload).toBeDisabled();
        });
      }
    );

    await step(
      "The same file can be selected and submitted again",
      async () => {
        await userEvent.upload(canvas.getByLabelText("Select file"), file);
        await expect(upload).toBeEnabled();
        await userEvent.click(upload);
        await waitFor(async () => {
          await expect(submitImport).toHaveBeenCalledTimes(2);
          await expect(upload).toBeDisabled();
        });
      }
    );
  },
};
