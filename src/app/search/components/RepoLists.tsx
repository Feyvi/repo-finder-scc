"use client";

import React from "react";
import type { Repo } from "../../../store/searchSlice";
import RepoItem from "../components/RepoItem";

interface Props {
  results: Repo[];
  analysisLoading: Record<number, boolean>;
  analysisResults: Record<number, unknown | null>;
  analysisError: Record<number, string | null>;
  onAnalyze: (repo: Repo) => void;
  hasSearched: boolean;
  loading: boolean;
}

export default function RepoList({
  results,
  analysisLoading,
  analysisResults,
  analysisError,
  onAnalyze,
  hasSearched,
  loading,
}: Props) {
  if (!hasSearched || loading) return <ul className="mt-6" />;

  if (results.length === 0)
    return (
      <ul className="mt-6 flex items-center justify-center min-h-[200px]">
        <li className="text-gray-600 text-center">Ничего не найдено</li>
      </ul>
    );

  return (
    <ul className="mt-6 space-y-4">
      {results.map((repo) => (
        <li
          key={repo.id}
          className="rounded-md border border-[var(--borderColor-default,var(--color-border-default,#30363d))] p-4"
        >
          <RepoItem
            repo={repo}
            loading={Boolean(analysisLoading[repo.id])}
            result={analysisResults[repo.id]}
            error={analysisError[repo.id]}
            onAnalyze={() => void onAnalyze(repo)}
          />
        </li>
      ))}
    </ul>
  );
}
