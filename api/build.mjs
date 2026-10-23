import { cpSync, readFileSync, writeFileSync } from "node:fs";

const entrypoints = Array.from(
  new Bun.Glob("functions/*/index.ts").scanSync({ onlyFiles: true })
).sort((a, b) => a.localeCompare(b));

if (entrypoints.length === 0) {
  throw new Error("No API function entry points found");
}

console.log(`Building ${entrypoints.length} functions...`);

const verbose = process.argv.includes("--verbose");
const result = await Bun.build({
  entrypoints,
  root: ".",
  target: "node",
  format: "esm",
  splitting: true,
  outdir: "dist",
  sourcemap: "linked",
  // The Azure Functions host provides this module.
  external: ["@azure/functions-core"],
  minify: {
    whitespace: true,
    syntax: true,
    // Bun 1.4.4 ignores keepNames, so retain identifiers for stable names.
    identifiers: false,
  },
  define: { "process.env.NODE_ENV": '"production"' },
  env: "disable",
  metafile: verbose,
});

if (!result.success) {
  throw new AggregateError(result.logs, "API build failed");
}

for (const message of result.logs) {
  console.warn(message);
}

if (verbose) {
  console.log(JSON.stringify(result.metafile, null, 2));
}

cpSync("host.json", "dist/host.json");

const { name, version } = JSON.parse(readFileSync("package.json", "utf-8"));
writeFileSync(
  "dist/package.json",
  JSON.stringify(
    { name, version, type: "module", main: "functions/**/*.js" },
    null,
    2
  )
);

console.log("Build complete!");
