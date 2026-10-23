import { spawnSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const apiRoot = import.meta.dirname;
const root = mkdtempSync(join(tmpdir(), "activity-tracker-build-"));
const api = join(root, "api");
const runtime = join(root, "runtime");
const names = readdirSync(join(apiRoot, "functions"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function run(command: string, args: string[], cwd = api) {
  return spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      databaseURL: "https://demo-activity-tracker.firebaseio.com",
      serviceWorkerId: "build-test",
    },
    encoding: "utf-8",
    timeout: 30_000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function expectSuccess(result: ReturnType<typeof run>) {
  expect(result.error).toBeUndefined();
  expect(result.status, result.stdout + result.stderr).toBe(0);
}

beforeAll(() => {
  cpSync(apiRoot, api, {
    recursive: true,
    filter: (path) =>
      ![
        "node_modules",
        "dist",
        "firebaseConfig.json",
        "local.settings.json",
      ].includes(basename(path)) && !basename(path).startsWith(".env"),
  });
  cpSync(join(apiRoot, "../shared"), join(root, "shared"), { recursive: true });
  cpSync(
    join(apiRoot, "../tsconfig.base.json"),
    join(root, "tsconfig.base.json")
  );
  symlinkSync(join(apiRoot, "node_modules"), join(api, "node_modules"), "dir");

  // Generated only in the isolated fixture, never production credentials.
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  writeFileSync(
    join(api, "firebase/firebaseConfig.json"),
    JSON.stringify({
      type: "service_account",
      project_id: "demo-activity-tracker",
      private_key_id: "build-test",
      private_key: privateKey,
      client_email: "build-test@demo-activity-tracker.iam.gserviceaccount.com",
      client_id: "build-test",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "",
      client_x509_cert_url: "",
    })
  );
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("Bun API tooling", () => {
  it("checks the API with both Bun and TypeScript 7", () => {
    expectSuccess(run("bun", ["run", "typecheck"]));
    expectSuccess(run(join(apiRoot, "node_modules/.bin/tsc"), ["--noEmit"]));
  }, 60_000);

  it("builds self-contained Node ESM and registers every HTTP function", () => {
    const build = run("bun", ["run", "build", "--verbose"]);
    expectSuccess(build);
    expect(build.stdout).toContain("Build complete!");
    const metadata = JSON.parse(
      build.stdout.slice(
        build.stdout.indexOf("{"),
        build.stdout.lastIndexOf("}") + 1
      )
    ) as { inputs: Record<string, unknown>; outputs: Record<string, unknown> };
    expect(Object.keys(metadata.inputs).length).toBeGreaterThan(names.length);
    expect(Object.keys(metadata.outputs).length).toBeGreaterThan(names.length);

    cpSync(join(api, "dist"), runtime, { recursive: true });
    const pkg = JSON.parse(
      readFileSync(join(runtime, "package.json"), "utf-8")
    );
    expect(pkg).toEqual({
      name: "api",
      version: "1.0.0",
      type: "module",
      main: "functions/**/*.js",
    });
    expect(readFileSync(join(runtime, "host.json"), "utf-8")).toBe(
      readFileSync(join(apiRoot, "host.json"), "utf-8")
    );
    for (const file of readdirSync(runtime, {
      recursive: true,
      encoding: "utf-8",
    })) {
      if (file.endsWith(".js")) {
        expectSuccess(run("node", ["--check", join(runtime, file)], runtime));
      }
    }
    for (const name of names) {
      const entry = join(runtime, "functions", name, "index.js");
      expect(readFileSync(entry, "utf-8")).toContain(
        "sourceMappingURL=index.js.map"
      );
      expect(JSON.parse(readFileSync(`${entry}.map`, "utf-8"))).toHaveProperty(
        "version",
        3
      );
    }

    const core = join(runtime, "node_modules/@azure/functions-core");
    mkdirSync(core, { recursive: true });
    writeFileSync(
      join(core, "index.js"),
      `exports.registered = new Map();
exports.setProgrammingModel = () => {};
exports.registerFunction = (metadata, handler) =>
  exports.registered.set(metadata.name, { metadata, handler });
`
    );
    const smoke = run(
      "node",
      [join(apiRoot, "test-support/bundle-smoke.mjs"), ...names],
      runtime
    );
    expectSuccess(smoke);
    expect(JSON.parse(smoke.stdout)).toEqual(names);
  }, 60_000);

  it("fails explicitly when a required build input is missing", () => {
    const config = join(api, "firebase/firebaseConfig.json");
    renameSync(config, `${config}.bak`);
    try {
      const build = run("bun", ["run", "build"]);
      expect(build.error).toBeUndefined();
      expect(build.status, build.stdout + build.stderr).not.toBe(0);
      expect(build.stdout).not.toContain("Build complete!");
      expect(build.stderr).toContain("firebaseConfig.json");
    } finally {
      renameSync(`${config}.bak`, config);
    }
  }, 60_000);

  it("rejects a project without function entry points", () => {
    const empty = join(root, "empty");
    mkdirSync(empty);
    const build = run("bun", [join(apiRoot, "build.mjs")], empty);
    expect(build.error).toBeUndefined();
    expect(build.status).not.toBe(0);
    expect(build.stdout).not.toContain("Build complete!");
    expect(build.stderr).toContain("No API function entry points found");
  });
});
