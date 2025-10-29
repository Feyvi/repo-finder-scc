import { runSpawn } from "./runSpawn";
import { toDockerMountPath } from "./utils";
import type { SpawnResult } from "./runSpawn";


export async function runSccOnWorkdir(workdir: string, timeoutMs: number): Promise<{ res: SpawnResult; debug: Record<string, unknown> }> {
  const useLocal = Boolean(process.env.USE_LOCAL_SCC === "1");
  const debug: Record<string, unknown> = {};
  if (useLocal) {
    const res = await runSpawn("scc", ["-f", "json", workdir], undefined, timeoutMs);
    debug.mode = "local";
    debug.code = res.code;
    debug.stdout = res.stdout?.slice(0, 2000);
    debug.stderr = res.stderr?.slice(0, 2000);
    return { res, debug };
  } else {
    const mountPath = toDockerMountPath(workdir);
    const dockerArgs = ["run", "--rm", "-v", `${mountPath}:/pwd`, "ghcr.io/boyter/scc:master", "scc", "-f", "json", "/pwd"];
    const res = await runSpawn("docker", dockerArgs, undefined, timeoutMs);
    debug.mode = "docker";
    debug.code = res.code;
    debug.stdout = res.stdout?.slice(0, 2000);
    debug.stderr = res.stderr?.slice(0, 2000);
    debug.mountPath = mountPath;
    return { res, debug };
  }
}
