import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { expect, type fn, sb, userEvent, within } from "storybook/test";
import { Login } from "./Login";

// Register firebase/auth for module mocking — all exports become fn() mocks
await sb.mock(import("firebase/auth"));

// Cast to mock type for test assertions
type MockFn = ReturnType<typeof fn>;
const mockSignInWithPopup = signInWithPopup as unknown as MockFn;
const mockSignInWithEmail = signInWithEmailAndPassword as unknown as MockFn;
const mockCreateUser = createUserWithEmailAndPassword as unknown as MockFn;

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

export const ToggleBackToSignIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText(/new user\? create account/i));
    await userEvent.click(
      canvas.getByText(/already have an account\? sign in/i)
    );

    expect(
      canvas.getByRole("button", { name: /sign in with email/i })
    ).toBeInTheDocument();
    expect(canvas.getByText(/new user\? create account/i)).toBeInTheDocument();
  },
};

export const GoogleSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockSignInWithPopup.mockRejectedValueOnce(
      new Error("Popup closed by user")
    );

    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with google/i })
    );

    expect(
      await canvas.findByText(/popup closed by user/i)
    ).toBeInTheDocument();
  },
};

export const EmailSignInError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockSignInWithEmail.mockRejectedValueOnce(new Error("Invalid credentials"));

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    expect(await canvas.findByText(/invalid credentials/i)).toBeInTheDocument();
  },
};

export const EmailSignUpError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockCreateUser.mockRejectedValueOnce(new Error("Email already in use"));

    await userEvent.click(canvas.getByText(/new user\? create account/i));
    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "password123");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign up with email/i })
    );

    expect(
      await canvas.findByText(/email already in use/i)
    ).toBeInTheDocument();
  },
};

export const ErrorClearedOnToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockSignInWithEmail.mockRejectedValueOnce(new Error("Invalid credentials"));

    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/password/i), "wrong");
    await userEvent.click(
      canvas.getByRole("button", { name: /sign in with email/i })
    );

    expect(await canvas.findByText(/invalid credentials/i)).toBeInTheDocument();

    // Toggle to sign up - error should be cleared
    await userEvent.click(canvas.getByText(/new user\? create account/i));

    expect(canvas.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  },
};
