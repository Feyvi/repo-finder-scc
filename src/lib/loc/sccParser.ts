export type LangMap = Record<string, number>;

export interface SCCLanguageEntry {
  Name?: string;
  name?: string;
  Language?: string;
  language?: string;

  Lines?: number;
  lines?: number;
  Code?: number;
  code?: number;
  ULOC?: number;
  Count?: number;

  totals?: Record<string, unknown>;
  [key: string]: unknown;
}

export type SCCParsed =
  | SCCLanguageEntry[]
  | {
      languages?: SCCLanguageEntry[] | Record<string, number>;
      totals?: Record<string, unknown>;
      [key: string]: unknown;
    }
  | Record<string, unknown>;

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function pickCount(entry: unknown): number {
  if (!isPlainObject(entry)) return 0;
  const candidates = ["Lines", "lines", "Code", "code", "Count", "ULOC"];

  for (const k of candidates) {
    const maybe = (entry as Record<string, unknown>)[k];
    if (typeof maybe === "number" && Number.isFinite(maybe)) return maybe;
    if (typeof maybe === "string") {
      const n = Number(String(maybe).replace(/[^0-9.-]+/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }

  const rawTotals = (entry as Record<string, unknown>).totals;
  if (isPlainObject(rawTotals)) {
    const totalsObj = rawTotals as Record<string, unknown>;
    for (const k of candidates) {
      const maybe = totalsObj[k];
      if (typeof maybe === "number" && Number.isFinite(maybe)) return maybe;
      if (typeof maybe === "string") {
        const n = Number(String(maybe).replace(/[^0-9.-]+/g, ""));
        if (Number.isFinite(n)) return n;
      }
    }
  }

  return 0;
}

export function sumPossibleFields(obj: unknown): number {
  if (obj === null || obj === undefined) return 0;
  if (Array.isArray(obj)) {
    return obj.reduce((s, it) => s + sumPossibleFields(it), 0);
  }
  if (isPlainObject(obj)) {
    const keys = ["Lines", "lines", "Code", "code", "ULOC", "Count"];
    let s = 0;
    for (const k of keys) {
      const v = (obj as Record<string, unknown>)[k];
      if (typeof v === "number" && Number.isFinite(v)) s += v;
      if (typeof v === "string") {
        const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
        if (Number.isFinite(n)) s += n;
      }
    }

    // totals
    const rawTotals = (obj as Record<string, unknown>).totals;
    if (isPlainObject(rawTotals)) {
      const totalsObj = rawTotals as Record<string, unknown>;
      for (const k of keys) {
        const v = totalsObj[k];
        if (typeof v === "number" && Number.isFinite(v)) s += v;
        if (typeof v === "string") {
          const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
          if (Number.isFinite(n)) s += n;
        }
      }
    }

    const langs = (obj as Record<string, unknown>).languages;
    if (Array.isArray(langs)) s += sumPossibleFields(langs);
    return s;
  }
  return 0;
}

export function extractLanguageMap(parsed: unknown): LangMap {
  const map: LangMap = {};
  if (parsed === null || parsed === undefined) return map;

  if (Array.isArray(parsed)) {
    for (const raw of parsed) {
      if (!isPlainObject(raw)) continue;
      const name = String(raw.Name ?? raw.name ?? raw.Language ?? raw.language ?? "").trim();
      if (!name) continue;
      const cnt = pickCount(raw);
      map[name] = (map[name] || 0) + cnt;
    }
    return map;
  }

  if (isPlainObject(parsed)) {
    const langsField = parsed.languages;
    if (langsField !== undefined) {
      if (Array.isArray(langsField)) {
        for (const raw of langsField) {
          if (!isPlainObject(raw)) continue;
          const name = String(raw.Name ?? raw.name ?? raw.Language ?? raw.language ?? "").trim();
          if (!name) continue;
          const cnt = pickCount(raw);
          map[name] = (map[name] || 0) + cnt;
        }
        return map;
      }
      if (isPlainObject(langsField)) {
        const langsObj = langsField as Record<string, unknown>;
        for (const [k, v] of Object.entries(langsObj)) {
          if (typeof v === "number" && Number.isFinite(v)) {
            map[k] = (map[k] || 0) + v;
          } else if (typeof v === "string") {
            const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
            map[k] = (map[k] || 0) + (Number.isFinite(n) ? n : 0);
          } else if (isPlainObject(v)) {
            map[k] = (map[k] || 0) + pickCount(v);
          } else {
            map[k] = (map[k] || 0) + 0;
          }
        }
        return map;
      }
    }

    for (const [k, v] of Object.entries(parsed)) {
      const keyLower = String(k).toLowerCase();
      if (["totals", "total", "scc", "files"].includes(keyLower)) continue;
      if (typeof v === "number" && Number.isFinite(v)) {
        map[k] = (map[k] || 0) + v;
      } else if (typeof v === "string") {
        const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
        map[k] = (map[k] || 0) + (Number.isFinite(n) ? n : 0);
      } else if (isPlainObject(v)) {
        const cnt = pickCount(v);
        if (cnt > 0) map[k] = (map[k] || 0) + cnt;
      }
    }

    return map;
  }

  return map;
}
