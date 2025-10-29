"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { Repo } from "../../store/searchSlice";
import SearchForm from "./components/SearchForm";
import RepoList from "./components/RepoLists";
import Pagination from "./components/Pagination";
import { PER_PAGE } from "./utils";
import { useSearchActions } from "./hooks/useSearchActions";
import Loader from "./components/Loader";

export default function SearchPage() {
  const {
    query,
    results,
    loading,
    page: storePage,
  } = useSelector((s: RootState) => s.search);

  const [input, setInput] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [minStars, setMinStars] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [analysisLoading, setAnalysisLoading] = useState<
    Record<number, boolean>
  >({});
  const [analysisResults, setAnalysisResults] = useState<
    Record<number, any | null>
  >({});
  const [analysisError, setAnalysisError] = useState<
    Record<number, string | null>
  >({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const {
    initFromUrl,
    handleSearch,
    handlePrev,
    handleNext,
    handleAnalyze,
    handleGoToPage,
  } = useSearchActions({
    input,
    selectedOptions,
    minStars,
    sort,
    visiblePage,
    setInput,
    setSelectedOptions,
    setMinStars,
    setSort,
    setVisiblePage,
    setTotalCount,
    setAnalysisLoading,
    setAnalysisResults,
    setAnalysisError,
  });

  useEffect(() => {
    void initFromUrl();
  }, []);

  useEffect(() => {
    if (query && query.trim().length > 0) {
      setHasSearched(true);
    }
  }, [query]);

  const paginatedResults: Repo[] = results.slice(
    (visiblePage - 1) * PER_PAGE,
    visiblePage * PER_PAGE
  );

  return (
    <div className="p-12 min-h-screen flex flex-col">
      <h1 className="text-3xl mb-4 font-bold">Поиск репозиториев GitHub</h1>

      <SearchForm
        input={input}
        setInput={setInput}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        minStars={minStars}
        setMinStars={setMinStars}
        sort={sort}
        setSort={setSort}
        onSearch={() => {
          setHasSearched(true);
          void handleSearch(
            input,
            selectedOptions.map((s) => s.value),
            minStars,
            sort,
            1
          );
          setVisiblePage(1);
        }}
      />

      {loading && (
        <div className="flex flex-1 items-center justify-center min-h-[300px]">
          <Loader />
        </div>
      )}

      <div className="flex-grow">
        <RepoList
          results={paginatedResults}
          analysisLoading={analysisLoading}
          analysisResults={analysisResults}
          analysisError={analysisError}
          onAnalyze={handleAnalyze}
          hasSearched={hasSearched}
          loading={loading}
        />
      </div>

      {results.length > 0 && (
        <Pagination
          visiblePage={visiblePage}
          totalPages={Math.ceil(results.length / PER_PAGE)}
          onPrev={handlePrev}
          onNext={() => handleNext(results.length)}
          onPage={(p) => handleGoToPage(p)}
          windowSize={5}
        />
      )}
    </div>
  );
}
