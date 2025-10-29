import axios from "axios";
import redis from "../lib/redis";
import { Repo } from "@/store/searchSlice";
import { DEFAULT_SEARCH_MAX_RESULTS, DEFAULT_PER_PAGE } from "./config";

const GITHUB_API = "https://api.github.com";

interface SearchParams {
  query: string;
  languages?: string[] | null;
  minStars?: string | null;
  sort?: string | null;
  maxResults?: number;
  page?: number;
}

const getRepoLanguages = async (owner: string, repo: string, token?: string) => {
  const cacheKey = `repoLang:${owner}:${repo}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  try {
    const headers = token ? { Authorization: `token ${token}` } : undefined;
    const res = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers });
    await redis.setex(cacheKey, 60 * 60 * 24, JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return {};
  }
};

export const searchRepos = async ({
  query,
  languages,
  minStars,
  sort,
  maxResults = DEFAULT_SEARCH_MAX_RESULTS,
  page = 1,
}: SearchParams) => {
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: `token ${token}` } : undefined;

  let allRepos: Repo[] = [];
  const perPage = DEFAULT_PER_PAGE; // 100
  const totalPages = Math.ceil(maxResults / perPage);

  for (let p = page; p <= totalPages; p++) {
    const cacheKey = `repos:${query}:${(languages && languages.length ? languages.join("|") : "any")}:${minStars || 0}:${sort || "default"}:${p}:${perPage}:${maxResults}`;
    const cached = await redis.get(cacheKey);
    let reposPage: Repo[] = [];

    if (cached) {
      reposPage = JSON.parse(cached);
    } else {
      let searchQuery = query;
      if (minStars) searchQuery += ` stars:>=${minStars}`;

      const params: Record<string, string | number> = {
        q: searchQuery,
        per_page: perPage,
        page: p,
      };
      if (sort === "stars" || sort === "name") {
        params.sort = sort === "name" ? "full_name" : "stars";
        params.order = "desc";
      }

      const res = await axios.get(`${GITHUB_API}/search/repositories`, {
        params,
        headers,
      });
      reposPage = res.data.items || [];
      await redis.setex(cacheKey, 600, JSON.stringify(reposPage));
    }

    allRepos.push(...reposPage);

    if (allRepos.length >= maxResults) break;
    if (reposPage.length < perPage) break;
  }

  if (languages && languages.length > 0) {
    const tokenForLang = token;
    const filtered: Repo[] = [];
    const batchSize = 10;
    for (let i = 0; i < allRepos.length; i += batchSize) {
      const batch = allRepos.slice(i, i + batchSize);
      const checks = await Promise.all(
        batch.map(async (repo) => {
          const langs = await getRepoLanguages(repo.owner.login, repo.name, tokenForLang);
          const available = Object.keys(langs || {}).map((s) => s.toLowerCase());
          const hasAll = languages.every((req) =>
            available.some((a) => a === req.toLowerCase())
          );
          return hasAll ? repo : null;
        })
      );
      for (const r of checks) if (r) filtered.push(r);
    }
    allRepos = filtered;
  }

  return {
    totalCount: allRepos.length,
    items: allRepos.slice(0, maxResults),
  };
};
