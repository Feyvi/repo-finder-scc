"use client";

import React from "react";

interface LoaderProps {
  size?: number;
  color?: string;
}

export default function Loader({ size = 100, color = "#155dfc" }: LoaderProps) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        className="animate-spin-slow"
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        ></circle>
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="125.6"
          strokeDashoffset="125.6"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="125.6;0"
            dur="2s"
            repeatCount="indefinite"
          ></animate>
        </circle>
      </svg>
    </div>
  );
}
