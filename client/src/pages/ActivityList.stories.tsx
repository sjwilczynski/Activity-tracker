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

    await canvas.findByText("All Activities");

    await step("Verify page header is visible", async () => {
      expect(canvas.getByText("Activity History")).toBeInTheDocument();
      expect(
        canvas.getByPlaceholderText(/search activities/i)
      ).toBeInTheDocument();
    });

    await step("Verify activity list has content", async () => {
      expect(canvas.getByText(/of 30 activities/i)).toBeInTheDocument();
    });
  },
};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: "mobile2",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText("All Activities");
    expect(canvas.getByText("Activity History")).toBeInTheDocument();
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

    await canvas.findByText("All Activities");
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

    await canvas.findByText("All Activities");

    await step("Open and close edit dialog", async () => {
      const editButtons = canvas.getAllByRole("button", { name: /edit/i });
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /save changes/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /save changes/i })
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const EditRowSavesAndUpdates: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step(
      "Edit first activity from Running to Cycling and verify table updates",
      async () => {
        // The first row (most recent activity) is "Running"
        // Verify it's there before editing
        const rows = canvas.getAllByTestId("activity-row");
        expect(within(rows[0]).getByText("Running")).toBeInTheDocument();

        // Click the edit button for the first row
        const editButtons = canvas.getAllByRole("button", { name: /edit/i });
        await userEvent.click(editButtons[0]);

        // Wait for dialog to open
        await screen.findByRole("button", { name: /save changes/i });

        // Open the activity name combobox and select "Cycling"
        const combobox = screen.getByRole("combobox", {
          name: /activity name/i,
        });
        await userEvent.click(combobox);

        await screen.findByText("Sports");

        const cyclingOption = screen.getByRole("option", {
          name: /cycling/i,
        });
        await userEvent.click(cyclingOption);

        // Save changes
        await userEvent.click(
          screen.getByRole("button", { name: /save changes/i })
        );

        // Dialog should close
        await waitFor(() => {
          expect(
            screen.queryByRole("heading", { level: 2, name: /edit activity/i })
          ).not.toBeInTheDocument();
        });

        // The first row should now show "Cycling" instead of "Running"
        await waitFor(() => {
          const updatedRows = canvas.getAllByTestId("activity-row");
          expect(
            within(updatedRows[0]).getByText("Cycling")
          ).toBeInTheDocument();
        });
      }
    );
  },
};

export const DeleteRowInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");
    canvas.getByText(/1–10 of 30/i);

    const deleteButtons = canvas.getAllByRole("button", { name: /^delete$/i });
    await userEvent.click(deleteButtons[0]);

    await waitFor(
      () => {
        expect(canvas.getByText(/1–10 of 29/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  },
};

export const DateFilterInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step("Open date range picker", async () => {
      const dateButton = canvas.getByRole("button", { name: /all time/i });
      expect(dateButton).toBeInTheDocument();
      await userEvent.click(dateButton);

      await waitFor(() => {
        expect(screen.getByText("Select Date Range")).toBeInTheDocument();
      });
    });

    await step("Apply Last Week preset", async () => {
      await userEvent.click(screen.getByRole("button", { name: /last week/i }));

      await waitFor(() => {
        expect(screen.queryByText("Select Date Range")).not.toBeInTheDocument();
      });
    });

    await step("Verify filtered results", async () => {
      await waitFor(() => {
        expect(canvas.getByText("All Activities")).toBeInTheDocument();
      });
    });
  },
};

export const DateFilterInvalidRange: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step("Open date range picker", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /all time/i }));
      await waitFor(() => {
        expect(screen.getByText("Select Date Range")).toBeInTheDocument();
      });
    });

    await step("Set end date before start date", async () => {
      const fromInput = screen.getByLabelText("From") as HTMLInputElement;
      const toInput = screen.getByLabelText("To") as HTMLInputElement;

      await userEvent.clear(fromInput);
      await userEvent.type(fromInput, "2024-12-31");
      await userEvent.clear(toInput);
      await userEvent.type(toInput, "2024-01-01");
    });

    await step("Verify error and Apply button disabled", async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/start date must be before/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
    });
  },
};

export const ExportActivities: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    const exportButton = canvas.getByRole("button", { name: /export/i });
    expect(exportButton).toBeEnabled();

    await userEvent.click(exportButton);
    expect(exportButton).toBeInTheDocument();
  },
};

export const UploadDialogInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step("Open and close upload dialog", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /upload/i }));

      await waitFor(() => {
        expect(screen.getByText(/import data/i)).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: /close/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/import data/i)
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const FileUploadFileTooLarge: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step("Open upload dialog", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /upload/i }));
      await screen.findByText(/import data/i);
    });

    await step("Upload file larger than 1MB and verify error", async () => {
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

    await canvas.findByText("All Activities");

    await step("Open upload dialog", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /upload/i }));
      await screen.findByText(/import data/i);
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

export const DeleteAllInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step("Open and cancel delete all dialog", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /delete all/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/delete all activities\?/i)
        ).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByText(/delete all activities\?/i)
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const KeyboardFocusRestoration: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByText("All Activities");

    await step(
      "Upload dialog: Tab to button, open, close with Escape, focus returns to trigger",
      async () => {
        // Tab order: All time, search input, Export, Upload
        await userEvent.tab();
        await userEvent.tab();
        await userEvent.tab();
        await userEvent.tab();

        const uploadButton = canvas.getByRole("button", { name: /upload/i });
        expect(uploadButton).toHaveFocus();

        await userEvent.keyboard("{Enter}");
        await screen.findByText(/import data/i);

        await userEvent.keyboard("{Escape}");
        await waitFor(() => {
          expect(
            screen.queryByText(/import data/i)
          ).not.toBeInTheDocument();
        });

        await waitFor(() => {
          expect(uploadButton).toHaveFocus();
        });
      }
    );

    await step(
      "Delete All dialog: Tab to button, open, close with Escape, focus returns to trigger",
      async () => {
        // One more Tab from Upload → Delete All
        await userEvent.tab();

        const deleteAllButton = canvas.getByRole("button", {
          name: /delete all/i,
        });
        expect(deleteAllButton).toHaveFocus();

        await userEvent.keyboard("{Enter}");
        await waitFor(() => {
          expect(
            screen.getByText(/delete all activities\?/i)
          ).toBeInTheDocument();
        });

        await userEvent.keyboard("{Escape}");
        await waitFor(() => {
          expect(
            screen.queryByText(/delete all activities\?/i)
          ).not.toBeInTheDocument();
        });

        await waitFor(() => {
          expect(deleteAllButton).toHaveFocus();
        });
      }
    );

    await step(
      "Edit dialog: Tab to Edit button, open, close with Escape, focus returns to Edit button",
      async () => {
        // Tab from Delete All → first Edit button
        await userEvent.tab();

        const editButtons = canvas.getAllByRole("button", { name: /edit/i });
        const firstEditButton = editButtons[0];
        expect(firstEditButton).toHaveFocus();

        await userEvent.keyboard("{Enter}");
        await screen.findByText(/edit activity/i);

        await userEvent.keyboard("{Escape}");
        await waitFor(() => {
          expect(screen.queryByText(/edit activity/i)).not.toBeInTheDocument();
        });

        // Re-query after dialog close since DOM may have re-rendered
        await waitFor(() => {
          const currentEditButtons = canvas.getAllByRole("button", {
            name: /edit/i,
          });
          expect(currentEditButtons[0]).toHaveFocus();
        });
      }
    );
  },
};
