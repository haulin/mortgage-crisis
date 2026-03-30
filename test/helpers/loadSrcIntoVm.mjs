import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SRC_DIR = path.join(REPO_ROOT, "src");

async function listSrcFiles() {
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".js"))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Loads `src/*.js` into a Node VM context, in the same deterministic order
 * as `scripts/build.mjs` (lexicographic by filename).
 *
 * Provide additional globals via `extraGlobals` if a test needs TIC-80 APIs.
 */
export async function loadSrcIntoVm({ extraGlobals } = {}) {
  const context = vm.createContext({
    // TIC-80 stubs used by current boot code (and safe defaults for most tests).
    cls: () => {},
    print: () => {},
    rect: () => {},
    rectb: () => {},
    line: () => {},
    spr: () => {},
    btn: () => 0,
    btnp: () => 0,
    // Seed policy stubs (TIC-80 provides these; tests keep them deterministic).
    tstamp: () => 0,

    // Useful for debugging tests.
    console,

    ...(extraGlobals || {})
  });

  const files = await listSrcFiles();
  if (files.length === 0) throw new Error("expected src/*.js files");

  for (const fileName of files) {
    const fullPath = path.join(SRC_DIR, fileName);
    const source = await fs.readFile(fullPath, "utf8");
    new vm.Script(source, { filename: `src/${fileName}` }).runInContext(context);
  }

  return context;
}

