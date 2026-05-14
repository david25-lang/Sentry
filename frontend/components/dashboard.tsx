"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  Camera01Icon,
  AiBrain01Icon,
  GitCompareIcon,
  Upload01Icon,
  Target01Icon,
  ZapIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSentryStore } from "@/lib/store";

type SampleKind = "pothole" | "crack";

type SampleImage = {
  id: string;
  title: string;
  description: string;
  src: string;
  fileName: string;
  kind: SampleKind;
};

const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: "pothole-lot",
    title: "Parking Lot Pothole",
    description: "Standing water inside a deep cavity",
    src: "/images/20250223_104730.jpg",
    fileName: "20250223_104730.jpg",
    kind: "pothole",
  },
  {
    id: "manhole-cracks",
    title: "Manhole Cracks",
    description: "Fractures spreading around a service cover",
    src: "/images/20250219_164807.jpg",
    fileName: "20250219_164807.jpg",
    kind: "crack",
  },
  {
    id: "edge-break",
    title: "Edge Break",
    description: "Cracked shoulder and worn lane edge",
    src: "/images/20250223_144310.jpg",
    fileName: "20250223_144310.jpg",
    kind: "crack",
  },
  {
    id: "surface-crack",
    title: "Surface Cracking",
    description: "Longitudinal cracks across the lane",
    src: "/images/20250223_144843.jpg",
    fileName: "20250223_144843.jpg",
    kind: "crack",
  },
  {
    id: "urban-potholes",
    title: "Urban Potholes",
    description: "Clustered potholes on a city roadway",
    src: "/images/potholes647_png.rf.735ddab0dad4f7dd47df3a37a014df76.jpg",
    fileName: "potholes647_png.rf.735ddab0dad4f7dd47df3a37a014df76.jpg",
    kind: "pothole",
  },
  {
    id: "crosswalk-pothole",
    title: "Crosswalk Pothole",
    description: "Potholes near a pedestrian crossing",
    src: "/images/vlcsnap-2025-02-18-17h10m30s786.jpg",
    fileName: "vlcsnap-2025-02-18-17h10m30s786.jpg",
    kind: "pothole",
  },
  {
    id: "arterial-roadway",
    title: "Arterial Roadway",
    description: "Long stretch with visible surface wear",
    src: "/images/vlcsnap-00061.jpg",
    fileName: "vlcsnap-00061.jpg",
    kind: "crack",
  },
  {
    id: "suburban-lane",
    title: "Suburban Lane",
    description: "Residential road with scattered cracks",
    src: "/images/vlcsnap-2025-02-18-18h33m13s011.jpg",
    fileName: "vlcsnap-2025-02-18-18h33m13s011.jpg",
    kind: "crack",
  },
  {
    id: "rural-approach",
    title: "Rural Approach",
    description: "Roadway edge wear near a turn",
    src: "/images/vlcsnap-2025-02-19-14h29m42s669.jpg",
    fileName: "vlcsnap-2025-02-19-14h29m42s669.jpg",
    kind: "crack",
  },
];

const sampleKindLabels: Record<SampleKind, string> = {
  pothole: "Pothole",
  crack: "Crack",
};

const sampleKindStyles: Record<SampleKind, string> = {
  pothole: "border-orange-500/30 bg-orange-500/15 text-orange-200",
  crack: "border-blue-500/30 bg-blue-500/15 text-blue-200",
};

const HERO_SAMPLE_ID = "urban-potholes";

const summaryStats = [
  { label: "Potholes", value: "12" },
  { label: "Cracks", value: "28" },
  { label: "Total Issues", value: "40" },
];

const modelCards = [
  {
    name: "YOLOv8",
    description: "Fast | Accurate | Real-time",
    highlight: true,
  },
  {
    name: "EfficientDet",
    description: "High accuracy | Balanced",
  },
  {
    name: "ResNet50",
    description: "Deep CNN | Robust",
  },
  {
    name: "MobileNetV3",
    description: "Lightweight | Edge ready",
  },
];

const whyPoints = [
  {
    title: "High-accuracy detection",
    description: "Optimized for pothole and crack patterns.",
  },
  {
    title: "Real-time performance",
    description: "Low-latency models for field inspections.",
  },
  {
    title: "Easy integration",
    description: "Upload, camera, or API workflows in minutes.",
  },
  {
    title: "Scalable deployments",
    description: "From small teams to smart city fleets.",
  },
];

const overlayTags = [
  { label: "Crack 0.87", className: "right-5 top-5" },
  { label: "Pothole 0.92", className: "left-5 bottom-6" },
  { label: "Pothole 0.84", className: "right-8 bottom-16" },
];

export function Dashboard() {
  const { setActiveTab } = useSentryStore();
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);

  const sampleCount = SAMPLE_IMAGES.length;
  const activeSample = SAMPLE_IMAGES[activeSampleIndex] ?? SAMPLE_IMAGES[0];
  const heroSample = SAMPLE_IMAGES.find((sample) => sample.id === HERO_SAMPLE_ID) ?? SAMPLE_IMAGES[0];

  useEffect(() => {
    if (sampleCount === 0) return undefined;
    const timer = window.setInterval(() => {
      setActiveSampleIndex((current) => (current + 1) % sampleCount);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [sampleCount]);

  const handlePrevSample = () => {
    if (sampleCount === 0) return;
    setActiveSampleIndex((current) => (current - 1 + sampleCount) % sampleCount);
  };

  const handleNextSample = () => {
    if (sampleCount === 0) return;
    setActiveSampleIndex((current) => (current + 1) % sampleCount);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit border border-orange-500/30 bg-orange-500/10 text-orange-200">
            Smart
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Detect Road Damage.
              <span className="mt-2 block font-mono text-orange-400">Drive Safer.</span>
            </h1>
            <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
              Upload or capture road images, run YOLO and CNN models, and get precise pothole and crack
              detection in seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setActiveTab("detect")}
              className="rounded-full bg-orange-500 px-6 text-xs text-black shadow-[0_0_28px_rgba(249,115,22,0.3)] hover:bg-orange-400"
            >
              <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="h-4 w-4" />
              Start YOLO Detection
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("compare")}
              className="rounded-full border-white/15 bg-white/5 px-6 text-xs text-white hover:bg-white/10"
            >
              <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} className="h-4 w-4" />
              Compare Models
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <span className="uppercase tracking-[0.2em] text-zinc-500">Trusted by</span>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200">
              CityWorks
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200">
              RoadSense
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200">
              InfraMap
            </Badge>
          </div>
        </div>

        <Card className="relative overflow-hidden border-white/10 bg-black/50 text-zinc-100 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,136,0,0.2),transparent_55%)]" />
          <CardContent className="relative space-y-4 p-4">
            <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="uppercase tracking-[0.2em]">Sentry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                {heroSample ? (
                  <img
                    key={heroSample.id}
                    src={heroSample.src}
                    alt={`${heroSample.title} sample`}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="h-64 w-full bg-white/5" />
                )}
                {overlayTags.map((tag) => (
                  <div
                    key={tag.label}
                    className={`absolute ${tag.className} rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-semibold text-black shadow-[0_0_10px_rgba(249,115,22,0.5)]`}
                  >
                    {tag.label}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Detection Summary</p>
                  <div className="mt-3 space-y-2">
                    {summaryStats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{stat.label}</span>
                        <span className="text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Model Used</p>
                  <p className="mt-2 text-sm text-white">YOLOv8</p>
                  <p className="text-xs text-zinc-500">Confidence Threshold 0.56</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  View Full Report
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-black/40 text-zinc-100 transition-all duration-500 hover:border-orange-500/20 hover:shadow-[0_0_36px_rgba(249,115,22,0.12)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
              <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-base">Capture</CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              Upload photos or use your camera to capture road conditions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">Upload</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">Camera</Badge>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 text-zinc-100 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_36px_rgba(59,130,246,0.2)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-base">Detect</CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              AI models locate potholes and cracks with bounding boxes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">YOLO</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">CNN</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">Fast</Badge>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 text-zinc-100 transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_36px_rgba(139,92,246,0.2)]">
          <CardHeader className="space-y-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="h-5 w-5" />
            </div>
            <CardTitle className="text-white text-base">Classify</CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              CNN models classify damage types for quick triage.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">Label</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-200 text-xs">Lightweight</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-white/10 bg-black/40 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-white">Powerful AI Models</CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              Choose the best model for your needs and compare performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {modelCards.map((model) => (
              <div
                key={model.name}
                className={`rounded-2xl border p-3 transition-all duration-300 ${
                  model.highlight
                    ? "border-orange-500/40 bg-orange-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{model.name}</p>
                  {model.highlight && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-orange-200">Primary</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-400">{model.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-white">Why Sentry?</CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              Built for teams that need reliable road intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {whyPoints.map((point) => (
              <div
                key={point.title}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{point.title}</p>
                  <p className="text-xs text-zinc-400">{point.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-black/40 to-orange-500/5 text-zinc-100 transition-all duration-500 hover:from-orange-500/15 hover:via-black/35 hover:to-orange-500/10 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">Built for the field</p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
              Built for governments, engineers, and smart cities
            </h3>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Improve road safety, reduce maintenance costs, and make data-driven decisions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setActiveTab("detect")}
              className="rounded-full bg-orange-500 px-5 text-xs text-black shadow-[0_0_28px_rgba(249,115,22,0.28)] hover:bg-orange-400"
            >
              Get Started for Free
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 px-5 text-xs text-white hover:bg-white/10"
            >
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
