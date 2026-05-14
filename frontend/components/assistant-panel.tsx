import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const assistantTips = [
  {
    title: "Capture guidance",
    description: "Aim for a top-down angle and avoid harsh shadows for higher confidence.",
  },
  {
    title: "Model choice",
    description: "Use YOLO for precise localization, CNN for overall severity.",
  },
  {
    title: "Field ops",
    description: "Batch uploads for patrol footage to detect recurring hotspots.",
  },
];

export function AssistantPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-orange-300" />
            <span className="text-white">Sentry Assistant</span>
          </div>
          <Badge variant="outline" className="border-orange-500/40 text-orange-200">
            Active
          </Badge>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Real-time guidance for smart-city inspectors.
        </p>
      </div>

      <div className="space-y-3">
        {assistantTips.map((tip) => (
          <div key={tip.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-sm text-white">
              <Sparkles className="h-4 w-4 text-orange-300" />
              {tip.title}
            </div>
            <p className="mt-2 text-xs text-zinc-400">{tip.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          Recommended action
        </div>
        <p className="mt-2">
          Prioritize road segments with repeated high-severity detections in the last 7 days.
        </p>
      </div>
    </div>
  );
}
