import { spawn } from "child_process";

export type SpawnResult = { code: number | null; stdout: string; stderr: string };

export async function runSpawn(
  cmd: string,
  args: string[],
  cwd?: string,
  timeoutMs = 120000
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";

    const to = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch (e) {
        // ignore
      }
      reject(new Error(`Process timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout?.on("data", (b) => (stdout += b.toString()));
    child.stderr?.on("data", (b) => (stderr += b.toString()));

    child.on("error", (err) => {
      clearTimeout(to);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(to);
      resolve({ code, stdout, stderr });
    });
  });
}
