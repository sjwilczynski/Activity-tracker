import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  darkPreferencesHandler,
  handlers as defaultHandlers,
} from "../mocks/handlers";
import { Settings } from "./Settings";

const meta: Meta<typeof Settings> = {
  title: "Pages/Settings",
  component: Settings,
  parameters: { tanstack: { router: { path: "/settings" } } },
};

export default meta;
type Story = StoryObj<typeof Settings>;

function getVisibleButtons(
  canvas: ReturnType<typeof within>,
  name: RegExp
): HTMLElement[] {
  return canvas
    .getAllByRole("button", { name })
    .filter((el: HTMLElement) => el.offsetParent !== null);
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Heading
    await expect(await canvas.findByText("Settings")).toBeInTheDocument();
    await expect(
      canvas.getByText("Manage your categories and activity types")
    ).toBeInTheDocument();

    // Tabs
    await expect(
      canvas.getByRole("tab", { name: /categories/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: /activity names/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: /appearance/i })
    ).toBeInTheDocument();

    // Categories tab content loads asynchronously
    // Both mobile cards and desktop table are in DOM (CSS toggles visibility)
    const sportsElements = await canvas.findAllByText("Sports");
    await expect(sportsElements.length).toBeGreaterThanOrEqual(1);
    await expect(canvas.getAllByText("Wellness").length).toBeGreaterThanOrEqual(
      1
    );
    await expect(canvas.getAllByText("Learning").length).toBeGreaterThanOrEqual(
      1
    );

    // Type badges (duplicated across mobile/desktop views)
    const activeBadges = canvas.getAllByText("active");
    await expect(activeBadges.length).toBeGreaterThanOrEqual(2);
    await expect(canvas.getAllByText("inactive").length).toBeGreaterThanOrEqual(
      1
    );

    // Activity names badges shown per category
    await expect(canvas.getAllByText("Running").length).toBeGreaterThanOrEqual(
      1
    );
    await expect(canvas.getAllByText("Swimming").length).toBeGreaterThanOrEqual(
      1
    );
    await expect(canvas.getAllByText("Yoga").length).toBeGreaterThanOrEqual(1);

    // Add category button
    await expect(canvas.getByText("Add Category")).toBeInTheDocument();
  },
};

export const ActivityNamesTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for data to load first
    await canvas.findAllByText("Sports");

    // Switch to Activity Names tab
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));

    // Activity Names tab content should appear
    await expect(await canvas.findByText("Activity Name")).toBeInTheDocument();
    await expect(canvas.getByText("Count")).toBeInTheDocument();

    // Add Activity Name button should be present
    await expect(canvas.getByText("Add Activity Name")).toBeInTheDocument();
  },
};

export const AddActivityNameInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText("Sports");
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));
    await canvas.findByText("Activity Name");

    await step("Open add activity name dialog", async () => {
      await userEvent.click(canvas.getByText("Add Activity Name"));

      await waitFor(async () => {
        await expect(
          screen.getByText(
            "Add a new activity name and assign it to a category"
          )
        ).toBeInTheDocument();
      });
    });

    await step("Fill in name and verify submit button state", async () => {
      const input = screen.getByPlaceholderText(/e\.g\., Running/i);
      await expect(
        screen.getByRole("button", { name: /add activity name/i })
      ).toBeDisabled();

      await userEvent.type(input, "Stretching");

      await expect(
        screen.getByRole("button", { name: /add activity name/i })
      ).toBeEnabled();
    });

    await step("Submit and verify dialog closes", async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /add activity name/i })
      );

      await waitFor(async () => {
        await expect(
          screen.queryByText(
            "Add a new activity name and assign it to a category"
          )
        ).not.toBeInTheDocument();
      });
    });

    await step("Verify new name appears in categories tab badges", async () => {
      // Switch to categories tab and verify the badge appeared on Sports (default)
      await userEvent.click(canvas.getByRole("tab", { name: /categories/i }));

      await waitFor(async () => {
        await expect(
          canvas.getAllByText("Stretching").length
        ).toBeGreaterThanOrEqual(1);
      });
    });
  },
};

export const AppearanceTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for page to load
    await canvas.findByText("Settings");

    // Switch to Appearance tab
    await userEvent.click(canvas.getByRole("tab", { name: /appearance/i }));

    // Appearance tab content should appear (tab trigger + card title both contain "Appearance")
    const appearanceTexts = await canvas.findAllByText("Appearance");
    await expect(appearanceTexts).toHaveLength(2);
    await expect(canvas.getByText("Group by category")).toBeInTheDocument();
    await expect(canvas.getByText("Fun animations")).toBeInTheDocument();

    const switches = canvas.getAllByRole("switch");
    await expect(switches).toHaveLength(2);
  },
};

export const RenameActivityInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText("Sports");
    await userEvent.click(canvas.getByRole("tab", { name: /activity names/i }));
    await canvas.findByText("Activity Name");

    await step("Open rename dialog and verify content", async () => {
      const editButtons = getVisibleButtons(canvas, /edit/i);
      await userEvent.click(editButtons[0]);

      await waitFor(async () => {
        await expect(
          screen.getByText("Edit Activity Name")
        ).toBeInTheDocument();
      });

      await expect(
        screen.getByRole("button", { name: /update name/i })
      ).toBeDisabled();
    });

    await step("Type new name and submit", async () => {
      const input = screen.getByLabelText(/new activity name/i);
      await userEvent.clear(input);
      await userEvent.type(input, "Jogging");

      const updateButton = screen.getByRole("button", { name: /update name/i });
      await expect(updateButton).toBeEnabled();
      await userEvent.click(updateButton);

      // Dialog should close on success
      await waitFor(async () => {
        await expect(
          screen.queryByText("Edit Activity Name")
        ).not.toBeInTheDocument();
      });
    });
  },
};

export const DeleteCategoryDialogInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText("Sports");

    await step("Open delete dialog and verify radio options", async () => {
      const deleteButtons = getVisibleButtons(canvas, /delete/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(async () => {
        await expect(screen.getByText(/Delete "Sports"\?/)).toBeInTheDocument();
      });

      // Radio options are present
      const radios = screen.getAllByRole("radio");
      await expect(radios).toHaveLength(2);
      await expect(
        screen.getByText("Delete all activities in this category")
      ).toBeInTheDocument();
      await expect(
        screen.getByText("Reassign activities to another category")
      ).toBeInTheDocument();
    });

    await step("Select reassign option and verify target picker", async () => {
      const reassignRadio = screen.getByRole("radio", { name: /reassign/i });
      await userEvent.click(reassignRadio);

      await waitFor(async () => {
        await expect(screen.getByText("Target category")).toBeInTheDocument();
      });
    });

    await step("Cancel and verify dialog closes", async () => {
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(async () => {
        await expect(
          screen.queryByText(/Delete "Sports"\?/)
        ).not.toBeInTheDocument();
      });
      await expect(canvas.getAllByText("Sports").length).toBeGreaterThan(0);
    });
  },
};

export const DeleteCategoryWithActivities: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText("Sports");

    await step("Open delete dialog and submit with delete option", async () => {
      const deleteButtons = getVisibleButtons(canvas, /delete/i);
      await userEvent.click(deleteButtons[0]);

      await waitFor(async () => {
        await expect(screen.getByText(/Delete "Sports"\?/)).toBeInTheDocument();
      });

      // "Delete all activities" is the default selection
      await userEvent.click(
        screen.getByRole("button", { name: /delete category/i })
      );

      // Dialog should close on success
      await waitFor(async () => {
        await expect(
          screen.queryByText(/Delete "Sports"\?/)
        ).not.toBeInTheDocument();
      });
      await waitFor(async () => {
        await expect(canvas.queryAllByText("Sports")).toHaveLength(0);
      });
    });
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

    await waitFor(async () => {
      await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    await expect(
      canvas.getByRole("heading", { name: /settings/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("tab", { name: /categories/i })
    ).toBeInTheDocument();
  },
};
