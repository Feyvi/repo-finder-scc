import { NextRequest, NextResponse } from "next/server";
import { searchRepos } from "../../../lib/githubApi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") || "";
  const languagesParam = searchParams.get("languages") || "";
  const languages = languagesParam
    ? languagesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const minStars = searchParams.get("min_stars");
  const sort = searchParams.get("sort");
  const maxResultsParam = searchParams.get("max_results");
  const maxResults = maxResultsParam
    ? Number.isFinite(Number(maxResultsParam))
      ? parseInt(maxResultsParam, 10)
      : undefined
    : undefined;

  const query = rawQuery || (minStars ? "" : "stars:>30000");

  try {
    const results = await searchRepos({
      query,
      languages,
      minStars,
      sort,
      maxResults,
    });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from GitHub" },
      { status: 500 }
    );
  }
}
