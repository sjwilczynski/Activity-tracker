import { createServer, type ViteDevServer } from "vite";
import { afterEach, describe, expect, it } from "vitest";
import { reactCompiler } from "./react-compiler";

const fixtureId = "/src/compiler-fixture.tsx";
let server: ViteDevServer | undefined;

async function transformFixture(source: string, environment = "client") {
  server = await createServer({
    configFile: false,
    appType: "custom",
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
    plugins: [
      {
        name: "compiler-test-fixture",
        resolveId: (id) => (id === fixtureId ? fixtureId : undefined),
        load: (id) => (id === fixtureId ? source : undefined),
      },
      reactCompiler(),
    ],
  });
  return server.environments[environment].transformRequest(fixtureId);
}

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe("native React Compiler Vite integration", () => {
  const component = `
    export function Greeting({ name }: { name: string }) {
      return <div>Hello {name}</div>;
    }
  `;

  it("memoizes client components and retains source maps", async () => {
    const result = await transformFixture(component);

    expect(result?.code).toContain("compiler-runtime");
    expect(result?.code).toContain("_c(2)");
    expect(result?.code).toContain("$[0] !== name");
    expect(result?.code).not.toContain("name: string");
    expect(result?.map).toBeTruthy();
  });

  it("does not inject client memoization into server transforms", async () => {
    const result = await transformFixture(component, "ssr");

    expect(result?.code).not.toContain("compiler-runtime");
    expect(result?.code).not.toContain("react.memo_cache_sentinel");
  });

  it("preserves explicit compiler opt-outs", async () => {
    const result = await transformFixture(`
      export function Greeting({ name }: { name: string }) {
        "use no memo";
        return <div>Hello {name}</div>;
      }
    `);

    expect(result?.code).not.toContain("compiler-runtime");
  });

  it("surfaces fatal transform diagnostics", async () => {
    await expect(
      transformFixture("export function Broken( { return <div/>; }")
    ).rejects.toThrow();
  });
});
