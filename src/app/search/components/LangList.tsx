"use client";

import React from "react";
import type { LangMap } from "../utils";

interface Props {
  langs?: LangMap | null;
}

export default function LangList({ langs }: Props) {
  if (!langs) return null;
  const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  return (
    <ul className="text-xs mt-1 max-h-36 overflow-auto">
      {entries.map(([k, v]) => (
        <li key={k}>
          <span className="font-medium">{k}</span>: {v.toLocaleString()} строк
        </li>
      ))}
    </ul>
  );
}
