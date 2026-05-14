"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  Home01Icon,
  Camera01Icon,
  AiBrain01Icon,
  GitCompareIcon,
  Settings01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useSentryStore } from "@/lib/store";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: () => <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />,
    description: "Overview",
  },
  {
    id: "detect",
    label: "YOLO",
    icon: () => <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />,
    description: "YOLO analysis",
  },
  {
    id: "classify",
    label: "CNN",
    icon: () => <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} />,
    description: "CNN classification",
  },
  {
    id: "compare",
    label: "Compare",
    icon: () => <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} />,
    description: "Model comparison",
  },
  {
    id: "settings",
    label: "Settings",
    icon: () => <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
    description: "Preferences",
  },
];

export function Header() {
  const { activeTab, setActiveTab } = useSentryStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050203]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
            <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">Sentry</h1>
            <p className="text-xs text-zinc-400">Pothole and Crack Intelligence</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`rounded-full px-4 ${activeTab === item.id ? "bg-white text-black hover:bg-white/90" : "text-zinc-200 hover:bg-white/10 hover:text-white"}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveTab("detect")}
            className="rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-100 shadow-[0_0_24px_rgba(249,115,22,0.25)] hover:bg-orange-500/20"
          >
            Get Started
          </Button>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-[#0b0705] text-white">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-white">
                  <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="h-5 w-5 text-orange-400" />
                  Sentry Navigation
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-white/10" />
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`justify-start gap-3 rounded-xl ${activeTab === item.id ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10 hover:text-white"}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-zinc-400">{item.description}</p>
                    </div>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
