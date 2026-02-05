import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

const meta = {
  title: "States/RouteErrorBoundary",
  component: RouteErrorBoundary,
  parameters: {
    // Override the default router config for error boundary testing
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
} satisfies Meta<typeof RouteErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Placeholder component (never rendered, loader throws first)
const Placeholder = () => null;

// Loaders that throw Response errors (creates proper route error responses)
const throw401Loader = () => {
  throw new Response(null, { status: 401 });
};

const throw403Loader = () => {
  throw new Response(null, { status: 403 });
};

const throw404Loader = () => {
  throw new Response(null, { status: 404 });
};

const throw500Loader = () => {
  throw new Response(null, { status: 500 });
};

const throwGenericLoader = () => {
  throw new Error("Something went wrong");
};

export const Unauthorized: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        element: <Placeholder />,
        loader: throw401Loader,
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
};

export const Forbidden: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        element: <Placeholder />,
        loader: throw403Loader,
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
};

export const NotFound: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        element: <Placeholder />,
        loader: throw404Loader,
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
};

export const ServerError: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        element: <Placeholder />,
        loader: throw500Loader,
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
};

export const GenericError: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
        element: <Placeholder />,
        loader: throwGenericLoader,
        errorElement: <RouteErrorBoundary />,
      },
    }),
  },
};
