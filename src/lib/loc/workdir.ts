import fs from "fs/promises";
import path from "path";
import os from "os";

export async function createBaseTmpDir(): Promise<string> {
  const baseTmp = path.join(os.tmpdir(), "repo-finder-scc");
  await fs.mkdir(baseTmp, { recursive: true });
  return baseTmp;
}

export async function createWorkdir(owner: string, repo: string): Promise<string> {
  const baseTmp = await createBaseTmpDir();
  const workdir = path.join(baseTmp, `${owner}__${repo}`);
  await fs.mkdir(workdir, { recursive: true });
  return workdir;
}

export async function writeDebugFile(workdir: string, data: Record<string, unknown>) {
  try {
    await fs.writeFile(path.join(workdir, "scc-debug.json"), JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn("Failed to write debug file", e);
  }
}

export async function cleanupWorkdir(workdir: string) {
  try {
    if (!workdir) return;
    await fs.rm(workdir, { recursive: true, force: true });
  } catch (e) {
    console.warn("Cleanup failed", e);
  }
}
