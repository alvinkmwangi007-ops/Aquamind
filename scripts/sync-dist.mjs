import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "aquamind", "client", "dist");
const target = path.join(root, "dist");

if (!fs.existsSync(source)) {
  console.error(`Build output not found at ${source}`);
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
console.log(`Synced build output to ${target}`);
