"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Radar, SplitSquareHorizontal, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Detection Accuracy", value: "91.4%" },
  { label: "Precision", value: "89.7%" },
  { label: "Recall", value: "87.9%" },
  { label: "F1 Score", value: "88.8%" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.15),transparent_50%)]" />
      <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit border border-orange-500/30 bg-orange-500/10 text-orange-200">
            Smart City Platform
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Smart Road Damage Detection System
            </h1>
            <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
              Sentry detects potholes and cracks in real time using YOLOv8 and CNN models, enabling
              proactive maintenance and safer mobility across smart-city road networks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-orange-500 px-6 text-black hover:bg-orange-400">
              <Link href="/detect">
                <Camera className="mr-2 h-4 w-4" />
                Start Detection
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/compare">
                <SplitSquareHorizontal className="mr-2 h-4 w-4" />
                Compare Models
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-orange-500/20 via-cyan-500/5 to-transparent" />
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-orange-300" />
                Live Detection Preview
              </span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="relative">
              <Image
                src="/images/live-preview.png"
                alt="Road damage preview"
                width={720}
                height={540}
                className="h-72 w-full object-cover"
                priority
              />
              
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
