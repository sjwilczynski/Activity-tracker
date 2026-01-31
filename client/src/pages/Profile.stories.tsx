import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor, screen } from "storybook/test";
import { Profile } from "./Profile";
import { mockUser } from "../mocks/decorators";

const meta: Meta<typeof Profile> = {
  title: "Pages/Profile",
  component: Profile,
};

export default meta;
type Story = StoryObj<typeof Profile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/user name/i);

    expect(canvas.getByText(/test user/i)).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /upload activities/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /delete your activites/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /export activities/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  },
};

export const ExportModalInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exportButton = canvas.getByRole("button", {
      name: /export activities/i,
    });

    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });
  },
};

export const DeleteAllModalInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", {
      name: /delete your activites/i,
    });

    await waitFor(() => {
      expect(deleteButton).toBeEnabled();
    });

    await step("Open and verify delete modal", async () => {
      await waitFor(async () => {
        await userEvent.click(deleteButton);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/delete confirmation/i)).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to delete/i)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: /confirm/i })
      ).toBeInTheDocument();
    });

    await step("Close modal", async () => {
      await userEvent.click(screen.getByRole("button", { name: /close/i }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  },
};

export const FileUploadInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const uploadButton = await canvas.findByRole("button", {
      name: /upload activities/i,
    });

    await step("Open and close upload modal", async () => {
      await userEvent.click(uploadButton);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/activties upload/i)).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: /close/i }));
    });
  },
};

export const NoUserPhoto: Story = {
  parameters: {
    auth: {
      user: {
        ...mockUser,
        photoURL: null,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/user name/i);
    expect(canvas.getByText(/test user/i)).toBeInTheDocument();
  },
};

export const ExportActivitiesDownload: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const exportButton = canvas.getByRole("button", {
      name: /export activities/i,
    });

    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });

    // Click the export button - this will trigger the download in the browser
    // The browser will handle the file download, we just verify the button works
    await userEvent.click(exportButton);

    // Verify button is still in the document after click
    expect(exportButton).toBeInTheDocument();
  },
};

export const FileUploadFileTooLarge: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const uploadButton = await canvas.findByRole("button", {
      name: /upload activities/i,
    });

    await step("Open upload modal", async () => {
      await userEvent.click(uploadButton);
      await screen.findByRole("dialog");
    });

    await step("Upload file larger than 1MB and verify error", async () => {
      // Create a file larger than 1MB (1000 * 1024 bytes)
      const largeContent = "x".repeat(1001 * 1024);
      const largeFile = new File([largeContent], "large.json", {
        type: "application/json",
      });

      const fileInput = screen.getByLabelText(/select file/i, {
        selector: "input",
      });
      await userEvent.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });
    });
  },
};

export const FileUploadInvalidFormat: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const uploadButton = await canvas.findByRole("button", {
      name: /upload activities/i,
    });

    await step("Open upload modal", async () => {
      await userEvent.click(uploadButton);
      await screen.findByRole("dialog");
    });

    await step("Upload non-JSON file and verify error", async () => {
      const textFile = new File(["hello world"], "test.txt", {
        type: "text/plain",
      });

      const fileInput = screen.getByLabelText(/select file/i, {
        selector: "input",
      });
      await userEvent.upload(fileInput, textFile);

      await waitFor(() => {
        expect(screen.getByText(/unsupported format/i)).toBeInTheDocument();
      });
    });
  },
};
