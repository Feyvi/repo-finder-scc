"use client";

import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import type { Repo } from "../../../store/searchSlice";
import type { AppDispatch } from "../../../store/store";
import { setQuery, setResults, setLoading, setError, setPage } from "../../../store/searchSlice";
import { normalizeLangMap } from "../utils";

type LangMap = Record<string, number>;
type AnalysisResult = {
  linesOfCode: number;
  languages: LangMap;
  cached?: boolean;
  forksAnalyzed?: number;
};

type Option = { value: string; label: string };

interface UseSearchActionsParams {
  input: string;
  selectedOptions: Option[];
  minStars: string;
  sort: string;
  visiblePage: number;

  setInput: (v: string) => void;
  setSelectedOptions: (v: Option[]) => void;
  setMinStars: (v: string) => void;
  setSort: (v: string) => void;
  setVisiblePage: (v: number) => void;
  setTotalCount: (v: number) => void;

  setAnalysisLoading: (fn: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  setAnalysisResults: (fn: (prev: Record<number, AnalysisResult | null>) => Record<number, AnalysisResult | null>) => void;
  setAnalysisError: (fn: (prev: Record<number, string | null>) => Record<number, string | null>) => void;
}

export function useSearchActions(params: UseSearchActionsParams) {
  const {
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
  } = params;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrlAndPush = useCallback(
    (page: number) => {
      const p = new URLSearchParams();
      if (input) p.set("q", input);
      if (selectedOptions && selectedOptions.length) p.set("languages", selectedOptions.map((s) => s.value).join(","));
      if (minStars) p.set("min_stars", minStars);
      if (sort) p.set("sort", sort);
      p.set("page", String(page));
      router.push(`/search?${p.toString()}`);
    },
    [input, selectedOptions, minStars, sort, router]
  );

  const initFromUrl = useCallback(async () => {
    const q = searchParams.get("q") || "";
    const langsParam = searchParams.get("languages") || "";
    const langList = langsParam ? langsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const stars = searchParams.get("min_stars") || "";
    const sortParam = searchParams.get("sort") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10) || 1;

    setInput(q);
    setSelectedOptions(langList.map((l) => ({ value: l, label: l })));
    setMinStars(stars);
    setSort(sortParam);
    setVisiblePage(pageParam);
    dispatch(setPage(pageParam));

  }, [searchParams]);

  const handleSearch = useCallback(
    async (
      queryValue = input,
      languages: string[] = selectedOptions.map((o) => o.value),
      stars = minStars,
      sortParam = sort,
      page = 1
    ) => {
      dispatch(setQuery(queryValue));
      dispatch(setLoading());

      const params = new URLSearchParams();
      params.set("q", queryValue);
      if (languages && languages.length) params.set("languages", languages.join(","));
      if (stars) params.set("min_stars", stars);
      if (sortParam) params.set("sort", sortParam);
      params.set("page", String(page));

      router.push(`/search?${params.toString()}`);

      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          dispatch(setError(data.error || "Ошибка поиска"));
          setTotalCount(0);
          return;
        }

        dispatch(
          setResults({
            items: data.items || [],
            totalCount: data.totalCount || 0,
          })
        );
        setTotalCount(data.totalCount || 0);
        setVisiblePage(page);
        dispatch(setPage(page));
      } catch (e) {
        dispatch(setError("Ошибка сети при запросе поиска"));
        setTotalCount(0);
      }
    },
    [dispatch, input, selectedOptions, minStars, sort, router, setTotalCount, setVisiblePage]
  );

  const handlePrev = useCallback(() => {
    if (visiblePage > 1) {
      const newPage = visiblePage - 1;
      setVisiblePage(newPage);
      dispatch(setPage(newPage));
      buildUrlAndPush(newPage);
    }
  }, [visiblePage, setVisiblePage, dispatch, buildUrlAndPush]);

  const handleNext = useCallback((totalResultsLength: number) => {
    const PER_PAGE = 30; 
    const totalPages = Math.ceil(totalResultsLength / PER_PAGE);
    if (visiblePage < totalPages) {
      const newPage = visiblePage + 1;
      setVisiblePage(newPage);
      dispatch(setPage(newPage));
      buildUrlAndPush(newPage);
    }
  }, [visiblePage, setVisiblePage, dispatch, buildUrlAndPush]);

  const handleGoToPage = useCallback(async (page: number, serverSide = false) => {
    const pageNum = Math.max(1, Math.floor(page));
    setVisiblePage(pageNum);
    dispatch(setPage(pageNum));
    buildUrlAndPush(pageNum);

    if (serverSide) {
      await handleSearch(input || (searchParams.get("q") || ""), selectedOptions.map((s) => s.value), minStars, sort, pageNum);
    }
  }, [setVisiblePage, dispatch, buildUrlAndPush, handleSearch, input, selectedOptions, minStars, sort, searchParams]);

  const handleAnalyze = useCallback(
    async (repo: Repo) => {
      const key = repo.id;
      setAnalysisLoading((p) => ({ ...p, [key]: true }));
      setAnalysisError((p) => ({ ...p, [key]: null }));
      setAnalysisResults((p) => ({ ...p, [key]: null }));

      try {
        const res = await fetch("/api/loc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner: repo.owner.login, repo: repo.name }),
        });
        const data = await res.json();

        if (!res.ok) {
          setAnalysisError((p) => ({ ...p, [key]: data.error || "Ошибка анализа" }));
          return;
        }

        const rawLangs = data.languages ?? {};
        const langMap = normalizeLangMap(rawLangs);

        setAnalysisResults((p) => ({
          ...p,
          [key]: {
            linesOfCode: Number(data.linesOfCode ?? 0),
            languages: langMap,
            cached: Boolean(data.cached ?? false),
            forksAnalyzed: typeof data.forksAnalyzed === "number" ? data.forksAnalyzed : undefined,
          },
        }));
      } catch (e) {
        setAnalysisError((p) => ({ ...p, [key]: "Сетевая ошибка при запуске анализа" }));
      } finally {
        setAnalysisLoading((p) => ({ ...p, [key]: false }));
      }
    },
    [setAnalysisLoading, setAnalysisResults, setAnalysisError]
  );

  return {
    initFromUrl,
    handleSearch,
    handlePrev,
    handleNext,
    handleAnalyze,
    handleGoToPage,
  };
}
