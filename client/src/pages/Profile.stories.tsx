import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, waitFor, screen } from "storybook/test";
import { Profile } from "./Profile";
import { mockUser } from "../mocks/decorators";

const meta: Meta<typeof Profile> = {
  title: "Pages/Profile",
  component: Profile,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Profile>;

// Default story - normal authenticated state
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/user name/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify user info is displayed", async () => {
      expect(canvas.getByText(/test user/i)).toBeInTheDocument();
    });

    await step("Verify all action buttons are present", async () => {
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
    });
  },
};

// Export modal interaction
export const ExportModalInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step(
      "Wait for activities to load and button to be enabled",
      async () => {
        await waitFor(
          () => {
            const exportButton = canvas.getByRole("button", {
              name: /export activities/i,
            });
            expect(exportButton).not.toBeDisabled();
          },
          { timeout: 10000 }
        );
      }
    );
  },
};

// Delete all modal interaction
export const DeleteAllModalInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for delete button to be enabled", async () => {
      await waitFor(
        () => {
          const deleteButton = canvas.getByRole("button", {
            name: /delete your activites/i,
          });
          expect(deleteButton).not.toBeDisabled();
        },
        { timeout: 10000 }
      );
    });

    await step("Open delete modal", async () => {
      const deleteButton = canvas.getByRole("button", {
        name: /delete your activites/i,
      });
      await userEvent.click(deleteButton);
    });

    await step("Verify delete modal is open", async () => {
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/delete confirmation/i)).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to delete/i)
        ).toBeInTheDocument();
      });
    });

    await step("Verify confirm button is visible", async () => {
      expect(
        screen.getByRole("button", { name: /confirm/i })
      ).toBeInTheDocument();
    });

    await step("Close modal with close button", async () => {
      const closeButton = screen.getByRole("button", { name: /close/i });
      await userEvent.click(closeButton);
    });

    await step("Verify modal is closed", async () => {
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  },
};

// File upload modal interaction
export const FileUploadInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(
            canvas.getByRole("button", { name: /upload activities/i })
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Open upload modal", async () => {
      const uploadButton = canvas.getByRole("button", {
        name: /upload activities/i,
      });
      await userEvent.click(uploadButton);
    });

    await step("Verify upload modal is open", async () => {
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/activties upload/i)).toBeInTheDocument();
      });
    });

    await step("Close modal with close button", async () => {
      const closeButton = screen.getByRole("button", { name: /close/i });
      await userEvent.click(closeButton);
    });

    await step("Verify modal is closed", async () => {
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  },
};

// No user photo (fallback avatar)
export const NoUserPhoto: Story = {
  parameters: {
    auth: {
      user: {
        ...mockUser,
        photoURL: null,
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Wait for page to load", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/user name/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    await step("Verify user name is still displayed", async () => {
      expect(canvas.getByText(/test user/i)).toBeInTheDocument();
    });
  },
};
