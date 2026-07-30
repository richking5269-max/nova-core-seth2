import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(root, "dist");

if (path.dirname(output) !== root || path.basename(output) !== "dist") {
  throw new Error("Refusing to clean an unexpected build directory");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of ["index.html", "app.js", "styles.css", "_routes.json"]) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of ["admin", "signals"]) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}

const bundle = await rollup({ input: path.join(root, "worker", "entry.js") });
await bundle.write({
  file: path.join(output, "_worker.js"),
  format: "es"
});
await bundle.close();

console.log("NOVA CORE production assets prepared in dist/");
