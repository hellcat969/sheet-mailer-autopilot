import fs from "fs/promises";
import os from "os";
import path from "path";
const F = path.join(os.tmpdir(), "spectres-outreach-state.json");
export async function getState() {
  try { return JSON.parse(await fs.readFile(F, "utf8")); } catch { return {}; }
}
export async function setState(p) {
  const s = { ...(await getState()), ...p };
  try { await fs.writeFile(F, JSON.stringify(s)); } catch {}
  return s;
}
