import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const REPO_ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const SRC_DIR = path.join(REPO_ROOT, "src");

async function listSrcFiles() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".js"))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

test("src bundle loads and exposes PD + TIC", async () => {
  const context = vm.createContext({
    // TIC-80 stubs used by Phase 00 boot code.
    cls: () => {},
    print: () => {},

    // Provide a console in case something logs (harmless).
    console
  });

  const files = await listSrcFiles();
  assert.ok(files.length > 0, "expected src/*.js files");

  for (const fileName of files) {
    const fullPath = path.join(SRC_DIR, fileName);
    const source = await fs.readFile(fullPath, "utf8");
    const script = new vm.Script(source, { filename: `src/${fileName}` });
    script.runInContext(context);
  }

  assert.equal(typeof context.PD, "object");
  assert.equal(typeof context.PD.bootTick, "function");
  assert.equal(typeof context.TIC, "function");
});

