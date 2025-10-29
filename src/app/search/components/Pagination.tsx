"use client";
import React from "react";

interface Props {
  visiblePage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (page: number) => void;
  windowSize?: number;
}

function buildPages(totalPages: number, current: number, windowSize: number) {
  const res: (number | "ellipsis")[] = [];
  if (totalPages <= 1) return [1];

  if (totalPages <= windowSize + 2) {
    for (let i = 1; i <= totalPages; i++) res.push(i);
    return res;
  }
  res.push(1);

  const half = Math.floor(windowSize / 2);
  let left = current - half;
  let right = current + (windowSize - half - 1);

  if (left < 2) {
    left = 2;
    right = left + windowSize - 1;
  }
  if (right > totalPages - 1) {
    right = totalPages - 1;
    left = right - windowSize + 1;
    if (left < 2) left = 2;
  }
  if (left > 2) res.push("ellipsis");
  for (let p = left; p <= right; p++) res.push(p);
  if (right < totalPages - 1) res.push("ellipsis");
  res.push(totalPages);

  return res;
}

export default function Pagination({
  visiblePage,
  totalPages,
  onPrev,
  onNext,
  onPage,
  windowSize = 5,
}: Props) {
  const pages = buildPages(totalPages, visiblePage, windowSize);

  return (
    <div className="flex items-center justify-center gap-12 mt-6">
      <button
        onClick={onPrev}
        disabled={visiblePage === 1}
        className="px-3 py-1 bg-blue-600 rounded transition-colors duration-300 hover:bg-blue-700"
        aria-label="Previous page"
      >
        ←
      </button>

      <nav aria-label="Pagination" className="flex items-center gap-3">
        {pages.map((it, idx) =>
          it === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="px-3 py-1 text-gray-500 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => onPage(it)}
              aria-current={it === visiblePage ? "page" : undefined}
              className={`px-3 py-1 rounded ${
                it === visiblePage
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-black hover:bg-gray-900"
              }`}
            >
              {it}
            </button>
          )
        )}
      </nav>

      <button
        onClick={onNext}
        disabled={visiblePage >= totalPages}
        className="px-3 py-1 bg-blue-600 rounded transition-colors duration-300 hover:bg-blue-700"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}
