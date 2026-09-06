import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, within } from "storybook/test";
import { useRenameActivity } from "../data/mutations";

function ActionProbe() {
  const mutation = useRenameActivity();
  return (
    <div>
      <button
        onClick={() =>
          mutation.mutate({ oldName: "Running", newName: "Running" })
        }
      >
        Submit rename
      </button>
      {mutation.error && <p role="alert">{mutation.error.message}</p>}
    </div>
  );
}

const meta: Meta<typeof ActionProbe> = {
  title: "Testing/Mutation validation",
  component: ActionProbe,
  parameters: { tanstack: { router: { path: "/welcome" } } },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const RejectInvalidRenameWithoutChangingHistory: Story = {
  play: async ({ canvasElement }) => {
    const headers = { "x-auth-token": "mock-token-12345" };
    const before: unknown = await (
      await fetch("/api/export", { headers })
    ).json();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Submit rename" })
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "oldName and newName must be different"
    );
    await expect(
      await (await fetch("/api/export", { headers })).json()
    ).toEqual(before);
  },
};
