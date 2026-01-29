import * as esbuild from "esbuild";
import { cpSync, readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Find all function entry points
const functionsDir = "functions";
const entryPoints = {};

for (const name of readdirSync(functionsDir)) {
  const indexPath = join(functionsDir, name, "index.ts");
  try {
    if (statSync(indexPath).isFile()) {
      // Map output path -> input path to preserve functions/ directory structure
      entryPoints[`functions/${name}/index`] = indexPath;
    }
  } catch {
    // Not a function directory
  }
}

console.log(`Building ${Object.keys(entryPoints).length} functions...`);

// Banner to provide require() for packages that use dynamic require in ESM
const banner = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`.trim();

// Bundle each function with all dependencies
const result = await esbuild.build({
  entryPoints,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  splitting: true,
  outdir: "dist",
  outExtension: { ".js": ".js" },
  sourcemap: true,
  banner: { js: banner },
  // @azure/functions-core is provided by the Azure Functions runtime
  external: ["@azure/functions-core"],
  treeShaking: true,
  minify: true,
  keepNames: true,
  // Strip license comments (firebase-admin has many)
  legalComments: "none",
  // Help tree shaking in libraries that check NODE_ENV
  define: { "process.env.NODE_ENV": '"production"' },
  // Generate metafile for bundle analysis
  metafile: true,
});

// Print bundle size analysis with --verbose flag
if (process.argv.includes("--verbose")) {
  const analysis = await esbuild.analyzeMetafile(result.metafile);
  console.log(analysis);
}

// Copy host.json to dist
cpSync("host.json", "dist/host.json");

// Create minimal package.json for Azure Functions runtime
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const distPkg = {
  name: pkg.name,
  version: pkg.version,
  type: "module",
  main: "functions/**/*.js",
};
writeFileSync("dist/package.json", JSON.stringify(distPkg, null, 2));

console.log("Build complete!");
