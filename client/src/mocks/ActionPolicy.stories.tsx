import type { Meta, StoryObj } from "@storybook/react-vite";
import { useFetcher } from "react-router";
import { expect, userEvent, within } from "storybook/test";
import type { ActionResult } from "../data/actions";
import { actionRouting } from "./actionRouting";

function ActionProbe() {
  const fetcher = useFetcher<ActionResult>();
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="rename-activity" />
      <input type="hidden" name="oldName" value="Running" />
      <input type="hidden" name="newName" value="Jogging" />
      <button type="submit">Submit rename</button>
      {fetcher.data?.error && <p role="alert">{fetcher.data.error}</p>}
    </fetcher.Form>
  );
}

const meta: Meta<typeof ActionProbe> = {
  title: "Testing/Route action policy",
  component: ActionProbe,
  parameters: { reactRouter: actionRouting("welcome") },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const RejectSettingsMutationOnWelcome: Story = {
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
      "Unknown intent"
    );
    await expect(
      await (await fetch("/api/export", { headers })).json()
    ).toEqual(before);
  },
};
