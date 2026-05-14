"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSentryStore } from "@/lib/store";

const statusTone = (status?: string | null) => {
  const value = (status || "unknown").toLowerCase();
  if (value === "healthy" || value === "ok") {
    return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
  }
  if (value === "offline") {
    return "bg-red-500/15 text-red-200 border-red-500/30";
  }
  return "bg-amber-500/15 text-amber-200 border-amber-500/30";
};

const statusValue = (status?: string | null) =>
  (status || "unknown").toLowerCase();

const isHealthyStatus = (status?: string | null) => {
  const value = statusValue(status);
  return value === "healthy" || value === "ok";
};

const isOfflineStatus = (status?: string | null) =>
  statusValue(status) === "offline";

const StatusIndicatorIcon = ({ status }: { status?: string | null }) => {
  if (isHealthyStatus(status)) {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (isOfflineStatus(status)) {
    return <AlertTriangle className="h-4 w-4" />;
  }
  return <Activity className="h-4 w-4" />;
};

export function Sidebar() {
  const pathname = usePathname();
  const { health } = useSentryStore();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/10 bg-slate-950/60 px-6 py-6 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sentry</p>
            <p className="text-xs text-zinc-400">Road Damage Detection</p>
          </div>
        </Link>
        <Badge variant="outline" className="border-white/10 text-xs text-zinc-300">
          v1.0
        </Badge>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-zinc-300 transition",
                isActive
                  ? "border-orange-500/40 bg-orange-500/10 text-white"
                  : "hover:border-white/10 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                  isActive && "border-orange-500/40 bg-orange-500/10"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <StatusIndicatorIcon status={health?.status} />
          <span>System status</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge className={cn("border", statusTone(health?.status))}>
            {(health?.status || "unknown").toLowerCase()}
          </Badge>
          <span className="text-xs text-zinc-500">
            {health?.device || "edge"}
          </span>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          API: {health?.version || "1.0.0"} • {health?.model_loaded ? "models ready" : "loading"}
        </p>
      </div>
    </aside>
  );
}
