import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, within } from "storybook/test";
import { authActions } from "../mocks/auth";
import { Login } from "./Login";

const meta: Meta<typeof Login> = {
  title: "Auth/Login",
  component: Login,
  parameters: { tanstack: { router: { path: "/login" } } },
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Activity Tracker")).toBeInTheDocument();
    await expect(canvas.getByText("Sign in to continue")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText(/email/i)).toBeInTheDocument();
    await expect(canvas.getByLabelText(/password/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /sign in with email/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/new user\? create account/i)
    ).toBeInTheDocument();
  },
};

export const ToggleToSignUp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText(/new user\? create account/i));

    await expect(
      canvas.getByRole("button", { name: /sign up with email/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/already have an account\? sign in/i)
    ).toBeInTheDocument();
  },
};

export const GoogleSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    authActions.signInWithGoogle.mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/too-many-requests)."), {
        code: "auth/too-many-requests",
      })
    );

    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with google/i })
    );

    await expect(
      await canvas.findByText(/too many failed attempts/i)
    ).toBeInTheDocument();
  },
};

export const EmailSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    authActions.signInWithEmail.mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), {
        code: "auth/invalid-credential",
      })
    );

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    await expect(
      await canvas.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  },
};

export const EmailSignUpError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    authActions.signUp.mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/email-already-in-use)."), {
        code: "auth/email-already-in-use",
      })
    );

    await userEvent.click(canvas.getByText(/new user\? create account/i));
    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "password123");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign up with email/i })
    );

    await expect(
      await canvas.findByText(/an account with this email already exists/i)
    ).toBeInTheDocument();
  },
};

export const ErrorClearedOnToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    authActions.signInWithEmail.mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), {
        code: "auth/invalid-credential",
      })
    );

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrong");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    await expect(
      await canvas.findByText(/invalid email or password/i)
    ).toBeInTheDocument();

    // Toggle to sign up - error should be cleared
    await userEvent.click(canvas.getByText(/new user\? create account/i));

    await expect(
      canvas.queryByText(/invalid email or password/i)
    ).not.toBeInTheDocument();
  },
};
