import { createWorkdir, cleanupWorkdir, writeDebugFile } from "./workdir";
import { cloneRepoTo } from "./git";
import { runSccOnWorkdir } from "./sccRunner";
import { getCachedAnalysis, upsertAnalysis } from "./db";
import { extractLanguageMap, isPlainObject, sumPossibleFields, LangMap } from "./sccParser";
import { sanitizeSegment } from "./utils";
import type { SpawnResult } from "./runSpawn";
import fs from "fs/promises";

export type AnalyzeResult = {
  cached: boolean;
  linesOfCode: number;
  languages: LangMap;
  debug?: Record<string, unknown>;
};

export async function analyzeRepo(ownerRaw: string, repoRaw: string, opts?: { cloneTimeout?: number; sccTimeout?: number; keepWorkdir?: boolean }): Promise<AnalyzeResult> {
  const owner = sanitizeSegment(String(ownerRaw || "").trim());
  const repo = sanitizeSegment(String(repoRaw || "").trim());

  if (!owner || !repo) throw new Error("owner and repo required");

  const repoUrl = `https://github.com/${owner}/${repo}`;

  const cached = await getCachedAnalysis(repoUrl);
  if (cached) {
    return {
      cached: true,
      linesOfCode: cached.linesOfCode,
      languages: cached.languages as LangMap,
    };
  }

  const cloneTimeout = opts?.cloneTimeout ?? Number(process.env.LOC_CLONE_TIMEOUT_MS || 5 * 60 * 1000);
  const sccTimeout = opts?.sccTimeout ?? Number(process.env.LOC_SCC_TIMEOUT_MS || 5 * 60 * 1000);
  const keepWorkdir = typeof opts?.keepWorkdir === "boolean" ? opts.keepWorkdir : process.env.KEEP_WORKDIR === "1";

  let workdir = "";
  let cloneRes: SpawnResult | null = null;
  let sccRes: SpawnResult | null = null;
  const debug: Record<string, unknown> = {};

  try {
    workdir = await createWorkdir(owner, repo);

    cloneRes = await cloneRepoTo(workdir, owner, repo, cloneTimeout);
    debug.clone = { code: cloneRes.code, stdout: cloneRes.stdout, stderr: cloneRes.stderr };
    if (cloneRes.code !== 0) {
      throw new Error(`git clone failed: ${cloneRes.stderr || cloneRes.stdout}`);
    }

    const listing = await fs.readdir(workdir);
    if (!listing || listing.length === 0) {
      throw new Error("workdir empty after clone");
    }

    const sccRun = await runSccOnWorkdir(workdir, sccTimeout);
    sccRes = sccRun.res;
    debug.scc = sccRun.debug;
    if (sccRes.code !== 0) {
      throw new Error(`scc failed: ${sccRes.stderr || sccRes.stdout}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(sccRes.stdout);
    } catch (e) {
      const idx = sccRes.stdout.search(/[\[\{]/);
      if (idx >= 0) parsed = JSON.parse(sccRes.stdout.slice(idx));
      else throw new Error("Cannot parse scc output as JSON");
    }

    const languagesMap: LangMap = extractLanguageMap(parsed);

    let linesOfCode = 0;
    if (isPlainObject(parsed) && isPlainObject(parsed.totals)) {
      const t = parsed.totals as Record<string, unknown>;
      linesOfCode = Number(t.code ?? t.lines ?? t.Lines ?? 0) || 0;
    }
    if (!linesOfCode) {
      linesOfCode = Object.values(languagesMap).reduce((s, v) => s + (Number(v) || 0), 0);
      if (!linesOfCode) linesOfCode = sumPossibleFields(parsed);
    }

    const upserted = await upsertAnalysis(repoUrl, linesOfCode, languagesMap);

    if (keepWorkdir) {
      try {
        await writeDebugFile(workdir, { clone: cloneRes, scc: sccRes, debug, parsed, languagesMap });
      } catch (e) {
      }
    } else {
      try {
        await cleanupWorkdir(workdir);
        workdir = "";
      } catch (e) {
      }
    }

    const result: AnalyzeResult = {
      cached: false,
      linesOfCode: upserted.linesOfCode,
      languages: upserted.languages as LangMap,
      debug: keepWorkdir ? { workdir, debug } : undefined,
    };

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (workdir && (process.env.KEEP_WORKDIR === "1")) {
      try {
        await writeDebugFile(workdir, { clone: cloneRes, scc: sccRes, debug, error: message });
      } catch (_) {}
    }
    throw new Error(message);
  } finally {
    try {
      if (workdir && process.env.KEEP_WORKDIR !== "1") {
        await cleanupWorkdir(workdir);
      }
    } catch (e) {
      console.warn("Final cleanup failed", e);
    }
  }
}
