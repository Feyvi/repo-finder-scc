export const PER_PAGE = 30;

export type LangMap = Record<string, number>;
export type Option = { value: string; label: string };

export const LANGUAGES = [
  "JavaScript","TypeScript","Python","Java","C#","C++","C","Go","Rust","Ruby",
  "PHP","Swift","Kotlin","Scala","Objective-C","Shell","PowerShell","Dart","Elixir",
  "Haskell","Lua","Perl","R","MATLAB","CoffeeScript","Assembly","VimL","Makefile",
  "Erlang","Groovy","F#","Julia","Crystal","Nim","OCaml","CSS","HTML","Svelte",
  "Vue","Angular","React",
];

export function toOptions(list: string[]) {
  return list.map((l) => ({ value: l, label: l }));
}

export function normalizeLangMap(obj: unknown): LangMap {
  if (!obj || typeof obj !== "object") return {};
  const entries = Object.entries(obj as Record<string, unknown>);
  const map: LangMap = {};
  for (const [k, v] of entries) {
    if (typeof v === "number") {
      map[k] = v;
    } else if (typeof v === "string") {
      const n = Number(v.replace(/[^0-9.-]+/g, ""));
      map[k] = Number.isFinite(n) ? n : 0;
    } else if (v && typeof v === "object") {
      const candidateKeys = ["Lines", "lines", "Code", "code", "Count", "ULOC"];
      let found = 0;
      for (const kk of candidateKeys) {
        const maybe = (v as Record<string, unknown>)[kk];
        if (typeof maybe === "number") {
          found = maybe;
          break;
        }
        if (typeof maybe === "string") {
          const n = Number(String(maybe).replace(/[^0-9.-]+/g, ""));
          if (Number.isFinite(n)) {
            found = n;
            break;
          }
        }
      }
      map[k] = found;
    } else {
      map[k] = 0;
    }
  }
  return map;
}
