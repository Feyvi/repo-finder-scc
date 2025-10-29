import { runSpawn } from "./runSpawn";
import type { SpawnResult } from "./runSpawn";

export async function cloneRepoTo(workdir: string, owner: string, repo: string, timeoutMs: number): Promise<SpawnResult> {
  const gitUrl = `https://github.com/${owner}/${repo}.git`;
  return runSpawn("git", ["clone", "--depth", "1", gitUrl, workdir], undefined, timeoutMs);
}
