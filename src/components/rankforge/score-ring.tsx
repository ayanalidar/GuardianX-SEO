"use client";

import { scoreGrade } from "@/lib/seo/score";

export function ScoreRing({
  score,
  size = 120,
  stroke = 10,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = scoreGrade(score);

  return (
    <div
      className="relative inline-flex items-center justify-center rf-ring-glow"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            stroke: grade.color,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums"
          style={{ color: grade.color, fontSize: size * 0.28 }}
        >
          {score}
        </span>
        <span
          className="font-semibold tracking-wide"
          style={{ color: grade.color, fontSize: size * 0.11 }}
        >
          {grade.grade} · {grade.label}
        </span>
      </div>
    </div>
  );
}
