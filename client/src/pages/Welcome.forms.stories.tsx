import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { handlers } from "../mocks/handlers";
import { Welcome } from "./Welcome";

const meta: Meta<typeof Welcome> = {
  title: "Pages/Welcome/Form maintenance",
  component: Welcome,
};

export default meta;
type Story = StoryObj<typeof Welcome>;

export const DetailedDefaultsAndNestedDismissal: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", {
      name: /add with details/i,
    });
    await userEvent.click(trigger);
    const dialog = within(await screen.findByRole("dialog"));
    const initialDate = dialog.getByLabelText<HTMLInputElement>("Date").value;

    await step(
      "Form-level defaults mount without field-level overrides",
      async () => {
        await expect(
          dialog.getByRole("combobox", { name: /activity name/i })
        ).toHaveTextContent("Search activities...");
        await expect(dialog.getByLabelText("Time Spent")).toHaveValue(null);
        await expect(dialog.getByLabelText("Description")).toHaveValue("");
        // Opening explicitly sets the date, marking the existing form dirty.
        await expect(
          dialog.getByRole("button", { name: /log activity/i })
        ).toBeEnabled();
      }
    );

    await step(
      "Escape dismisses the nested autocomplete, not the dialog",
      async () => {
        const activity = dialog.getByRole("combobox", {
          name: /activity name/i,
        });
        await userEvent.click(activity);
        await screen.findByPlaceholderText(/search activities/i);
        await userEvent.keyboard("{Escape}");
        await waitFor(async () => {
          await expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
          await expect(activity).toHaveFocus();
        });
        await expect(screen.getByRole("dialog")).toBeInTheDocument();
      }
    );

    await step(
      "Cancel and reopen restore the detailed form defaults",
      async () => {
        await userEvent.type(
          dialog.getByLabelText("Description"),
          "Discard me"
        );
        await userEvent.type(dialog.getByLabelText("Time Spent"), "25");
        await userEvent.click(
          dialog.getByRole("combobox", { name: /intensity/i })
        );
        await userEvent.click(
          await screen.findByRole("option", { name: "High" })
        );
        await waitFor(async () => {
          await expect(
            screen.queryByRole("listbox", { hidden: true })
          ).not.toBeInTheDocument();
        });
        await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
        await waitFor(async () => {
          await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
          await expect(trigger).toHaveFocus();
        });
        await userEvent.click(trigger);
        const reopened = within(await screen.findByRole("dialog"));
        await expect(reopened.getByLabelText("Date")).toHaveValue(initialDate);
        await expect(reopened.getByLabelText("Description")).toHaveValue("");
        await expect(reopened.getByLabelText("Time Spent")).toHaveValue(null);
        await expect(
          reopened.getByRole("combobox", { name: /intensity/i })
        ).toHaveTextContent("None");
        await expect(
          reopened.getByRole("button", { name: /log activity/i })
        ).toBeEnabled();
      }
    );
  },
};

export const DetailedPendingAndServerError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/api/activities", async () => {
          await delay(500);
          return new HttpResponse(null, { status: 500 });
        }),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: /add with details/i })
    );
    const dialog = within(await screen.findByRole("dialog"));

    await step("Select an activity and submit", async () => {
      await userEvent.click(
        dialog.getByRole("combobox", { name: /activity name/i })
      );
      await userEvent.click(
        await screen.findByRole("option", { name: /running/i })
      );
      await userEvent.type(dialog.getByLabelText("Description"), "Keep me");
      await userEvent.click(
        dialog.getByRole("button", { name: /log activity/i })
      );
    });

    await step(
      "Router fetcher owns the pending state after Form submission",
      async () => {
        await expect(
          await dialog.findByRole("button", { name: /logging/i })
        ).toBeDisabled();
      }
    );

    await step(
      "Server failure keeps the dialog and values available to retry",
      async () => {
        await screen.findByText("Failed to log activity");
        await expect(dialog.getByLabelText("Description")).toHaveValue(
          "Keep me"
        );
        await expect(
          dialog.getByRole("combobox", { name: /activity name/i })
        ).toHaveTextContent("Running");
        await expect(
          dialog.getByRole("button", { name: /log activity/i })
        ).toBeEnabled();
      }
    );
  },
};
