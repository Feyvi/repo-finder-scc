"use client";

import React from "react";
import type { Repo } from "../../../store/searchSlice";
import LangList from "../components/LangList";

interface Props {
  repo: Repo;
  loading: boolean;
  result: any | null;
  error: string | null;
  onAnalyze: () => void;
}

export default function RepoItem({ repo, loading, result, error, onAnalyze }: Props) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-semibold"
        >
          {repo.name}
        </a>
        <div className="text-sm text-gray-600">⭐ {repo.stargazers_count} — {repo.language || "—"}</div>
        <p className="text-gray-700 mt-1">{repo.description}</p>
      </div>

      <div className="w-56 flex-shrink-0 flex flex-col">
        <div className="flex-1 flex items-center justify-center w-full">
          <button
            onClick={onAnalyze}
            className="bg-green-600 text-white px-3 py-1 rounded w-full"
            disabled={loading}
            aria-label="Посчитать LoC"
          >
            {loading ? "Считаем..." : "Посчитать LoC"}
          </button>
        </div>

        <div className="w-full mt-2 text-right text-sm">
          {error && <div className="text-red-500">{error}</div>}

          {result && (
            <div className="text-xs text-gray-800 bg-gray-50 p-2 rounded">
              <div>
                LoC: <strong>{Number(result.linesOfCode || 0).toLocaleString()}</strong>{" "}
                {result.cached ? <span className="text-xs text-gray-500">(кэш)</span> : null}
              </div>
              {typeof result.forksAnalyzed !== "undefined" && (
                <div className="text-xs text-gray-600">Проанализировано: {result.forksAnalyzed}</div>
              )}
              <details className="mt-1 text-left">
                <summary className="cursor-pointer text-xs text-blue-600">Показать языки</summary>
                <div className="mt-1"><LangList langs={result.languages} /></div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
