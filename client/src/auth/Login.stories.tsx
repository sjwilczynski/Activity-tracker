import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { expect, mocked, userEvent, within } from "storybook/test";
import { Login } from "./Login";

const meta: Meta<typeof Login> = {
  title: "Auth/Login",
  component: Login,
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Team active")).toBeInTheDocument();
    expect(canvas.getByText("Team lazy")).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
    expect(canvas.getByLabelText(/email/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /sign in with email/i })
    ).toBeInTheDocument();
    expect(canvas.getByText(/new user\? create account/i)).toBeInTheDocument();
  },
};

export const ToggleToSignUp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText(/new user\? create account/i));

    expect(
      canvas.getByRole("button", { name: /sign up with email/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByText(/already have an account\? sign in/i)
    ).toBeInTheDocument();
  },
};

export const GoogleSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mocked(signInWithPopup).mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/too-many-requests)."), {
        code: "auth/too-many-requests",
      })
    );

    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with google/i })
    );

    expect(
      await canvas.findByText(/too many failed attempts/i)
    ).toBeInTheDocument();
  },
};

export const EmailSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), {
        code: "auth/invalid-credential",
      })
    );

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    expect(
      await canvas.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  },
};

export const EmailSignUpError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
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

    expect(
      await canvas.findByText(/an account with this email already exists/i)
    ).toBeInTheDocument();
  },
};

export const ErrorClearedOnToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), {
        code: "auth/invalid-credential",
      })
    );

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrong");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    expect(
      await canvas.findByText(/invalid email or password/i)
    ).toBeInTheDocument();

    // Toggle to sign up - error should be cleared
    await userEvent.click(canvas.getByText(/new user\? create account/i));

    expect(
      canvas.queryByText(/invalid email or password/i)
    ).not.toBeInTheDocument();
  },
};
