import { NextRequest, NextResponse } from "next/server";
import { analyzeRepo } from "../../../lib/loc/locService";
import { sanitizeSegment } from "../../../lib/loc/utils";

const MAX_CONCURRENT = Number(process.env.LOC_MAX_CONCURRENCY || 2);
let currentRunning = 0;

export async function POST(req: NextRequest) {
  if (currentRunning >= MAX_CONCURRENT) {
    return NextResponse.json({ error: "Too many concurrent analyses" }, { status: 429 });
  }
  currentRunning++;

  try {
    const body = await req.json();
    const owner = String(body.owner || "").trim();
    const repo = String(body.repo || "").trim();

    if (!owner || !repo) {
      return NextResponse.json({ error: "owner and repo required" }, { status: 400 });
    }

    try {
      sanitizeSegment(owner);
      sanitizeSegment(repo);
    } catch (e) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }

    try {
      const result = await analyzeRepo(owner, repo);
      return NextResponse.json({
        cached: result.cached,
        linesOfCode: result.linesOfCode,
        languages: result.languages,
        debug: result.debug,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  } finally {
    currentRunning = Math.max(0, currentRunning - 1);
  }
}
