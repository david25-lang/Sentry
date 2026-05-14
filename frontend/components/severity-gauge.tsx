"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface SeverityGaugeProps {
  value: number;
  label: string;
  tone?: "low" | "medium" | "high" | "critical";
}

type SeverityTone = NonNullable<SeverityGaugeProps["tone"]>;

const toneColor: Record<SeverityTone, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export function SeverityGauge({ value, label, tone = "medium" }: SeverityGaugeProps) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={toneColor[tone]}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold text-white">{Math.round(value)}%</p>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Risk</p>
        </div>
      </div>
      <p className="text-xs text-zinc-400">{label}</p>
    </div>
  );
}
