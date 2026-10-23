import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(join(process.cwd(), "package.json"));
const { registered } = require("@azure/functions-core");
const names = process.argv.slice(2).sort((a, b) => a.localeCompare(b));

for (const name of names) {
  await import(pathToFileURL(join("functions", name, "index.js")).href);
}

assert.deepEqual(
  [...registered.keys()].sort((a, b) => a.localeCompare(b)),
  names
);

for (const { metadata, handler } of registered.values()) {
  assert.equal(handler.name, metadata.name);
  assert.ok(
    Object.values(metadata.bindings).some(
      (binding) => binding.type === "httpTrigger"
    )
  );
  for (const token of [undefined, "not-a-jwt"]) {
    const headers = new Headers();
    if (token) headers.set("x-auth-token", token);
    const response = await handler(
      new Request("http://localhost/api", {
        method: "POST",
        body: "{}",
        headers,
      }),
      {}
    );
    assert.equal(response.status, 401, metadata.name);
  }
}

console.log(JSON.stringify(names));
