"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  Target01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getDamageClassIcon } from "@/lib/api";


const damageClasses = [
  {
    id: 0,
    name: "Pothole",
    icon: "🕳️",
    description: "Holes or depressions in road surface",
    color: "bg-red-500",
    severity: "High",
  },
  {
    id: 1,
    name: "Crack",
    icon: "⚡",
    description: "Linear fractures in pavement",
    color: "bg-orange-500",
    severity: "Medium",
  },
  {
    id: 2,
    name: "Normal",
    icon: "✅",
    description: "No visible road damage",
    color: "bg-emerald-500",
    severity: "Low",
  },
];

export function Dashboard() {
  const {
    health,
    detectionHistory,
    setActiveTab,
    fetchModels,
    fetchClasses,
  } = useSentryStore();

  useEffect(() => {
    fetchModels();
    fetchClasses();
  }, [fetchModels, fetchClasses]);

  const totalDetections = detectionHistory.length;
  const successfulDetections = detectionHistory.filter((d) => d.success).length;
  const successRate = totalDetections > 0 ? (successfulDetections / totalDetections) * 100 : 0;
  const avgProcessingMs =
    totalDetections > 0
      ? detectionHistory.reduce((acc, item) => acc + item.processing_time_ms, 0) / totalDetections
      : 0;
  const recentAnalyses = detectionHistory.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-3 py-6 sm:px-6 lg:px-8">
      <section className="relative mx-auto grid w-full max-w-4xl gap-6 animate-fade-in">
        <Card className="relative overflow-hidden border-white/10 bg-black/45 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%),radial-gradient(circle_at_bottom,rgba(255,136,0,0.18),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(255,118,0,0.35),rgba(255,118,0,0.75))] blur-2xl opacity-0 transition-opacity duration-700 hover:opacity-100" />

          <CardHeader className="relative pt-10 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30 animate-pulse">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="mx-auto mb-3 w-fit border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-200 animate-fade-in [animation-delay:100ms]">
              AI Road Intelligence
            </Badge>
            <CardTitle className="text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl animate-fade-in [animation-delay:200ms]">
              Inspect Road Damage
            </CardTitle>
            <CardDescription className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-300 lg:text-base animate-fade-in [animation-delay:300ms]">
              YOLO detection • CNN classification • Model comparison
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6 px-3 pb-10 sm:px-8">
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-2xl border border-white/10 bg-black/45 p-3 sm:p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-black/60 cursor-pointer animate-fade-in [animation-delay:400ms]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">API</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-lg sm:text-2xl font-semibold capitalize text-white">{health?.status || "?"}</p>
                  <HugeiconsIcon
                    icon={health?.status === "healthy" ? CheckmarkCircle01Icon : AlertCircleIcon}
                    strokeWidth={2}
                    className={`h-4 sm:h-5 w-4 sm:w-5 transition-transform duration-300 group-hover:scale-110 ${health?.status === "healthy" ? "text-emerald-400" : "text-red-400"}`}
                  />
                </div>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-black/45 p-3 sm:p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-black/60 cursor-pointer animate-fade-in [animation-delay:500ms]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">Analyses</p>
                <p className="mt-2 text-lg sm:text-2xl font-semibold text-white">{totalDetections}</p>
                <p className="text-xs text-zinc-400">{successRate.toFixed(0)}% pass rate</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-black/45 p-3 sm:p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-black/60 cursor-pointer animate-fade-in [animation-delay:600ms]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">Latency</p>
                <p className="mt-2 text-lg sm:text-2xl font-semibold text-white">{formatProcessingTime(avgProcessingMs)}</p>
                <p className="text-xs text-zinc-400">avg inference</p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-black/45 p-3 sm:p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-black/60 cursor-pointer animate-fade-in [animation-delay:700ms]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">Device</p>
                <p className="mt-2 text-lg sm:text-2xl font-semibold uppercase text-white">{health?.device || "?"}</p>
                <p className="text-xs text-zinc-400">target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/40 text-zinc-100 transition-all duration-500 hover:border-orange-500/20 hover:shadow-[0_0_40px_rgba(249,115,22,0.1)] animate-fade-in [animation-delay:1100ms]">
            <CardHeader>
              <CardTitle className="text-white">Damage Classes</CardTitle>
              <CardDescription className="text-zinc-400 text-xs sm:text-sm">Severity levels</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {damageClasses.map((damage, idx) => (
                <div key={damage.id} className="group rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-all duration-300 hover:border-orange-500/30 hover:bg-white/10 hover:scale-105 cursor-pointer animate-fade-in" style={{animationDelay: `${1300 + idx * 100}ms`}}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{damage.icon}</p>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs whitespace-nowrap">
                      {damage.severity.split(' ')[0]}
                    </Badge>
                  </div>
                  <p className="mt-2 font-semibold text-white text-sm sm:text-base">{damage.name}</p>
                  <div className={`mt-3 h-1.5 rounded-full ${damage.color} transition-all duration-500 group-hover:h-2 group-hover:shadow-lg`} style={{boxShadow: damage.color.includes('red') ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 12px rgba(249,115,22,0.5)'}} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 text-zinc-100 transition-all duration-500 hover:border-orange-500/20 hover:shadow-[0_0_40px_rgba(249,115,22,0.1)] animate-fade-in [animation-delay:1200ms]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-2">
              <div>
                <CardTitle className="text-white text-base sm:text-lg">Recent</CardTitle>
                <CardDescription className="text-zinc-400 text-xs">Latest inferences</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("compare")}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 text-xs"
              >
                Compare
              </Button>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 sm:p-6 text-center text-xs sm:text-sm text-zinc-400">
                  No analyses. Start detecting!
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAnalyses.map((result, index) => (
                    <div key={index} className="group rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-orange-500/30 hover:bg-white/10 cursor-pointer animate-fade-in" style={{animationDelay: `${1400 + index * 80}ms`}}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xl sm:text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{result.primary_class ? getDamageClassIcon(result.primary_class) : "❓"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium capitalize text-white text-xs sm:text-sm truncate">{result.primary_class || "No damage"}</p>
                            <p className="text-xs text-zinc-500">{result.total_detections}x • {formatProcessingTime(result.processing_time_ms)}</p>
                          </div>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"} className="text-xs flex-shrink-0">
                          {result.model_used.split(/(?=[A-Z])/).join('').substring(0, 4)}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                          <span>Conf</span>
                          <span>{result.detections[0] ? `${Math.round(result.detections[0].confidence * 100)}%` : "—"}</span>
                        </div>
                        <Progress value={result.detections[0] ? result.detections[0].confidence * 100 : 0} className="h-1 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-orange-400 [&>div]:transition-all [&>div]:duration-700" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-black/40 to-orange-500/5 text-zinc-100 transition-all duration-500 hover:from-orange-500/15 hover:via-black/35 hover:to-orange-500/10 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] animate-fade-in [animation-delay:1900ms]">
          <CardContent className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">Next Step</p>
              <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl font-semibold text-white">Run analysis or compare models</h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">Fast, clean, ready for production</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 flex-shrink-0">
              <Button onClick={() => setActiveTab("detect")} className="rounded-full bg-orange-500 px-4 sm:px-6 text-xs sm:text-base text-black shadow-[0_0_28px_rgba(249,115,22,0.28)] hover:bg-orange-400 transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.45)]">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Detect
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("compare")} className="rounded-full border-white/15 bg-white/5 px-4 sm:px-6 text-xs sm:text-base text-white hover:bg-white/10 transition-all duration-300">
                <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
