import { describe, expect, it } from "vitest";
import { cn } from "./cn";

// Captured from clsx 2.1.1 + tailwind-merge 3.4.0 before replacing the wrapper.
const cases: {
  name: string;
  inputs: Parameters<typeof cn>;
  expected: string;
}[] = [
  {
    name: "conditional arrays, objects and empty inputs",
    inputs: [
      "base",
      ["flex", [false, "gap-2"]],
      { "font-bold": true, hidden: false },
      null,
      undefined,
      0,
    ],
    expected: "base flex gap-2 font-bold",
  },
  {
    name: "conflicting layout, color and typography",
    inputs: ["flex bg-primary text-sm", "grid bg-destructive text-lg"],
    expected: "grid bg-destructive text-lg",
  },
  {
    name: "padding longhands retain non-overlapping shorthand sides",
    inputs: ["p-4 px-2", "pl-6"],
    expected: "p-4 px-2 pl-6",
  },
  {
    name: "padding shorthand replaces earlier longhands",
    inputs: ["px-2 py-1 pl-6", "p-4"],
    expected: "p-4",
  },
  {
    name: "arbitrary dimensions and Radix CSS variables",
    inputs: [
      "w-4 w-[calc(100%-2rem)] h-8 h-(--popover-height)",
      "w-(--radix-popover-trigger-width)",
    ],
    expected: "h-(--popover-height) w-(--radix-popover-trigger-width)",
  },
  {
    name: "custom properties and theme colors",
    inputs: [
      "[--sidebar-width:16rem] [--sidebar-width:20rem] bg-(--background)",
      "bg-primary",
    ],
    expected: "[--sidebar-width:20rem] bg-primary",
  },
  {
    name: "important hover overrides stay separate from normal variants",
    inputs: [
      "bg-muted hover:bg-accent hover:bg-primary/10! hover:text-primary!",
      "hover:bg-destructive! hover:scale-110 active:scale-95",
    ],
    expected:
      "bg-muted hover:bg-accent hover:text-primary! hover:bg-destructive! hover:scale-110 active:scale-95",
  },
  {
    name: "legacy important prefix",
    inputs: ["!p-2 p-4", "!p-6"],
    expected: "p-4 !p-6",
  },
  {
    name: "responsive, dark and reordered equivalent modifiers",
    inputs: [
      "md:p-2 dark:bg-black hover:md:p-3",
      "md:p-4 dark:bg-slate-900 md:hover:p-5",
    ],
    expected: "md:p-4 dark:bg-slate-900 md:hover:p-5",
  },
  {
    name: "Radix data-state selectors",
    inputs: [
      "data-[state=open]:bg-accent data-[state=closed]:bg-muted",
      "data-[state=open]:bg-primary",
    ],
    expected: "data-[state=closed]:bg-muted data-[state=open]:bg-primary",
  },
  {
    name: "typed arbitrary font size and color",
    inputs: [
      "text-[length:var(--label-size)] text-[color:var(--label-color)]",
      "text-sm text-primary",
    ],
    expected: "text-sm text-primary",
  },
  {
    name: "custom gradients and shadows",
    inputs: [
      "bg-linear-to-br from-primary to-primary/80 shadow-md",
      "from-blue-500 shadow-lg",
    ],
    expected: "bg-linear-to-br to-primary/80 from-blue-500 shadow-lg",
  },
  {
    name: "focus and validation selectors remain independent",
    inputs: [
      "focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
      "focus-visible:ring-4",
    ],
    expected:
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 focus-visible:ring-4",
  },
];

describe("cn compatibility", () => {
  it.each(cases)("$name", ({ inputs, expected }) => {
    expect(cn(...inputs)).toBe(expected);
  });
});
