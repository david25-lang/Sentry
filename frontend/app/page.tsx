import Image from "next/image";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetectionCard } from "@/components/detection-card";
import {
  Radar,
  ScanSearch,
  Brain,
  LineChart,
  Camera,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "Real-time Detection",
    description: "Instantly locate potholes and cracks on captured frames.",
    icon: Radar,
  },
  {
    title: "YOLOv8 Object Detection",
    description: "Pinpoint damage with precise bounding boxes and confidence.",
    icon: ScanSearch,
  },
  {
    title: "CNN Classification",
    description: "Assess overall road condition and severity levels.",
    icon: Brain,
  },
  {
    title: "Smart Analytics",
    description: "Track detection trends, severity distribution, and hotspots.",
    icon: LineChart,
  },
  {
    title: "Live Camera Analysis",
    description: "Capture live inspections directly from the field.",
    icon: Camera,
  },
  {
    title: "Severity Detection",
    description: "Prioritize repairs with risk and urgency scoring.",
    icon: ShieldCheck,
  },
];

export default function Page() {
  return (
    <div className="space-y-16">
      <HeroSection />

      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Core Capabilities</h2>
            <p className="text-sm text-zinc-400">
              Built for government, smart-city, and infrastructure teams.
            </p>
          </div>
          <Badge variant="outline" className="border-orange-500/30 text-orange-200">
            Production-ready UI
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full">
                <CardContent className="space-y-3 py-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="text-xs text-zinc-400">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Model Performance</h2>
          <p className="text-sm text-zinc-400">Live benchmark metrics from recent validation runs.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetectionCard label="Detection Accuracy" value="75.4%" tone="orange" />
          <DetectionCard label="Precision" value="79.7%" tone="cyan" />
          <DetectionCard label="Recall" value="77.9%" tone="emerald" />
          <DetectionCard label="F1 Score" value="72.8%" tone="red" />
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Live Demo Preview</h2>
          <p className="text-sm text-zinc-400">Mock inference overlay showcasing damage localization.</p>
        </div>
        <Card className="overflow-hidden">
          <div className="relative">
            <Image
              src="/images/live-preview.png"
              alt="Detection preview"
              width={1200}
              height={720}
              className="h-80 w-full object-cover"
            />
          
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
}